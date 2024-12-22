<?php
// app/Services/RouteFinderService.php
namespace App\Services;

use Illuminate\Support\Facades\DB;
use DateTime;

class RouteFinderService
{
    public function findRoutes($origin, $destination, $company = null, $sortKey = null, $sortOrder = 'asc')
    {
        ini_set('memory_limit', '512M'); // Temporarily increase memory limit to avoid memory exhaustion
    
        $activePricelist = DB::table('pricelists')
            ->where('valid_until', '>', now())
            ->orderBy('created_at', 'desc')
            ->first();
    
        if (!$activePricelist) {
            // No active pricelist. Possibly fetch one now:
            app(\App\Http\Controllers\PricelistController::class)->fetchActivePricelists();
    
            // Re-check for newly inserted pricelist
            $activePricelist = DB::table('pricelists')
                ->where('valid_until', '>', now())
                ->orderBy('created_at', 'desc')
                ->first();
    
            if (!$activePricelist) {
                return []; // still no valid pricelist, so we can't provide routes
            }
        }
    
        $data = json_decode($activePricelist->data, true);
        $legs = $data['legs'] ?? [];
    
        // Build graph and find routes as before
        $graph = $this->buildGraph($legs);
        $paths = $this->findShortestPathsBFS($graph, $origin, $destination);
    
        if (empty($paths)) {
            return [];
        }
    
        $aggregated = $this->aggregateRoutesFromPaths($paths, $graph);
    
        // Filter by company if specified
    if ($company) {
        $aggregated = array_filter($aggregated, function ($route) use ($company) {
            return in_array($company, $route['companies']);
        });
    }
    
        if ($sortKey) {
            usort($aggregated, function ($a, $b) use ($sortKey, $sortOrder) {
                $cmp = $this->compareByKey($a, $b, $sortKey);
                return $sortOrder === 'asc' ? $cmp : -$cmp;
            });
        }
    
        // Limit response size if the result set is too large to handle
        if (count($aggregated) > 10) { // Example threshold for large data
            $aggregated = array_slice($aggregated, 0, 10);
        }
    
        return array_values($aggregated);
    }
    
    private function buildGraph($legs)
    {
        $graph = [];
        foreach ($legs as $leg) {
            $from = $leg['routeInfo']['from']['name'];
            $to = $leg['routeInfo']['to']['name'];
            $distance = $leg['routeInfo']['distance'];

            foreach ($leg['providers'] as $provider) {
                $price = $provider['price'];
                $company = $provider['company']['name'];
                $start = new DateTime($provider['flightStart']);
                $end = new DateTime($provider['flightEnd']);
                $travelTime = round(($end->getTimestamp() - $start->getTimestamp()) / 3600);

                if (!isset($graph[$from])) $graph[$from] = [];
                $graph[$from][] = [
                    'from' => $from,
                    'to' => $to,
                    'price' => $price,
                    'travelTime' => $travelTime,
                    'distance' => $distance,
                    'company' => $company
                ];
            }
        }
        return $graph;
    }

    private function findShortestPathsBFS($graph, $origin, $destination, $maxHops = 10)
    {
        if (!isset($graph[$origin])) return [];
        $queue = [[$origin]]; // Queue for BFS traversal
        $shortestPaths = [];
        $visitedPaths = [];

        while (!empty($queue)) {
            $path = array_shift($queue);
            $currentNode = end($path);

            // Stop exploring if max hops exceeded
            if (count($path) > $maxHops) continue;

            // Skip already visited paths to prevent loops
            if (isset($visitedPaths[implode('->', $path)])) continue;
            $visitedPaths[implode('->', $path)] = true;

            // If destination reached, add to shortestPaths
            if ($currentNode === $destination) {
                $shortestPaths[] = $path;
                continue;
            }

            // Enqueue all connected nodes
            if (isset($graph[$currentNode])) {
                foreach ($graph[$currentNode] as $route) {
                    $to = $route['to'];
                    if (!in_array($to, $path)) { // Avoid loops
                        $newPath = [...$path, $to];
                        $queue[] = $newPath;
                    }
                }
            }
        }

        return $shortestPaths;
    }


    private function aggregateRoutesFromPaths($paths, $graph)
    {
        $allAggregated = [];
        foreach ($paths as $path) {
            $allLegRoutes = [];
            for ($i = 0; $i < count($path)-1; $i++) {
                $from = $path[$i];
                $to = $path[$i+1];
                $possibleProviders = array_filter($graph[$from], fn($r) => $r['to'] === $to);
                if (empty($possibleProviders)) {
                    $allLegRoutes = [];
                    break;
                }
                if ($i === 0) {
                    foreach ($possibleProviders as $p) {
                        $allLegRoutes[] = [$p];
                    }
                } else {
                    $newRoutes = [];
                    foreach ($allLegRoutes as $existingRoute) {
                        foreach ($possibleProviders as $p) {
                            $newRoutes[] = [...$existingRoute, $p];
                        }
                    }
                    $allLegRoutes = $newRoutes;
                }
            }

            foreach ($allLegRoutes as $route) {
                $totalPrice = 0;
                $totalDistance = 0;
                $totalTime = 0;
                $companies = [];
                foreach ($route as $leg) {
                    $totalPrice += $leg['price'];
                    $totalDistance += $leg['distance'];
                    $totalTime += $leg['travelTime'];
                    $companies[] = $leg['company'];
                }
                $companies = array_values(array_unique($companies));
                $allAggregated[] = [
                    'legs' => $route,
                    'totalPrice' => $totalPrice,
                    'totalDistance' => $totalDistance,
                    'totalTime' => $totalTime,
                    'companies' => $companies
                ];
            }
        }
        return $allAggregated;
    }

    /**
     * BFS to find the shortest routes (by hop count) from $origin to $destination.
     * See the BFS function code provided earlier.
     */
    public function bfsUniqueShortest(array $graph, string $origin, string $destination): array
    {
        $queue = [];
        $queue[] = ['path' => [$origin], 'depth' => 0];
        $visited = [ $origin => true ];
        $shortestPaths = [];
        $minFoundDepth = PHP_INT_MAX;

        while (!empty($queue)) {
            $current = array_shift($queue);
            $path    = $current['path'];
            $depth   = $current['depth'];

            $lastNode = end($path);

            if ($depth > $minFoundDepth) {
                continue;
            }

            if ($lastNode === $destination) {
                $shortestPaths[] = $path;
                $minFoundDepth = $depth;
                continue;
            }

            if (!isset($graph[$lastNode])) {
                continue;
            }

            foreach ($graph[$lastNode] as $edge) {
                $nextNode = $edge['to'];

                if (in_array($nextNode, $path, true)) {
                    continue;
                }

                if (!isset($visited[$nextNode])) {
                    $visited[$nextNode] = true;
                    $newPath = [...$path, $nextNode];
                    $queue[] = ['path' => $newPath, 'depth' => $depth + 1];
                }
            }
        }

        return $shortestPaths;
    }

    private function compareByKey($a, $b, $key)
    {
        if ($key === 'price') {
            return $a['totalPrice'] - $b['totalPrice'];
        } else if ($key === 'travelTime') {
            return $a['totalTime'] - $b['totalTime'];
        } else if ($key === 'distance') {
            return $a['totalDistance'] - $b['totalDistance'];
        }
        return 0;
    }
}
