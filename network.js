// Create an async function to load and process the data
async function createNetworkVisualization() {
    // Add network selection dropdown
    const networkSelect = d3.select('#network-select')
        .on('change', async function() {
            // Clear existing visualization
            d3.select('#network-container').selectAll('*').remove();
            // Reload with new network
            await loadAndDisplayNetwork(this.value);
        });

    await loadAndDisplayNetwork('network1'); // Load first network by default
}

async function loadAndDisplayNetwork(networkFolder) {
    // Load metadata to get total number of nodes
    const metadata = await d3.json(`${networkFolder}/metadata.json`)
        .catch(error => {
            console.error('Error loading metadata:', error);
            console.log('Current folder:', networkFolder);
            return { num_nodes: 0 };
        });

    console.log('Metadata loaded:', metadata); // Add debug logging

    // Load the network data
    const data = await d3.text(`${networkFolder}/network.txt`);
    
    // Process the data into nodes and links, handling both spaces and tabs
    const links = data.trim().split('\n')
        .map(line => {
            const [source, target] = line.replace(/\t/g, ' ').split(' ').filter(Boolean).map(Number);
            return { source, target };
        })
        .filter(link => 
            link.source < metadata.num_nodes && 
            link.target < metadata.num_nodes &&
            link.source >= 0 && 
            link.target >= 0
        );
    
    console.log('Number of links:', links.length); // Add debug logging
    
    // Create nodes including isolated ones
    const nodes = [];
    
    // Add all nodes from 0 to num_nodes-1
    for (let i = 0; i < metadata.num_nodes; i++) {
        nodes.push({ id: i });
    }

    console.log('Number of nodes created:', nodes.length); // Add debug logging

    // Load centrality measures
    const degreeCentrality = await d3.json(`${networkFolder}/degree_centrality.json`)
        .catch(error => {
            console.error('Error loading degree centrality:', error);
            return {};
        });

    const eigenCentrality = await d3.json(`${networkFolder}/eigenvector_centrality.json`)
        .catch(error => {
            console.error('Error loading eigenvector centrality:', error);
            return {};
        });

    const katzCentrality = await d3.json(`${networkFolder}/katz_centrality.json`)
        .catch(error => {
            console.error('Error loading katz centrality:', error);
            return {};
        });

    const pageRankCentrality = await d3.json(`${networkFolder}/pagerank.json`)
        .catch(error => {
            console.error('Error loading pagerank:', error);
            return {};
        });

    const betweennessCentrality = await d3.json(`${networkFolder}/betweenness_centrality.json`)
        .catch(error => {
            console.error('Error loading betweenness centrality:', error);
            return {};
        });

    const closenessCentrality = await d3.json(`${networkFolder}/closeness_centrality.json`)
        .catch(error => {
            console.error('Error loading closeness centrality:', error);
            return {};
        });

    const localClustering = await d3.json(`${networkFolder}/local_clustering.json`)
        .catch(error => {
            console.error('Error loading local clustering:', error);
            return {};
        });

    // Set up the SVG container
    const width = window.innerWidth;
    const height = window.innerHeight - 50;
    
    const svg = d3.select('#network-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a group for the zoom functionality
    const g = svg.append('g');
    
    // Set up zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);

    // Helper function to get node color
    function getNodeColor(d) {
        return isIsolated(d) ? '#ff7f7f' : '#69b3a2';
    }

    // Function to update node sizes and colors based on centrality
    function updateVisualization(centralityMeasure) {
        let centrality = {};
        
        switch(centralityMeasure) {
            case 'no-centrality':
                nodes.forEach(node => { centrality[node.id] = 1; });
                break;
            case 'degree':
                centrality = degreeCentrality;
                break;
            case 'eigenvector':
                centrality = eigenCentrality;
                break;
            case 'katz':
                centrality = katzCentrality;
                break;
            case 'pagerank':
                centrality = pageRankCentrality;
                break;
            case 'betweenness':
                centrality = betweennessCentrality;
                break;
            case 'closeness':
                centrality = closenessCentrality;
                break;
            case 'clustering':
                centrality = localClustering;
                break;
            default:
                nodes.forEach(node => { centrality[node.id] = 1; });
        }

        // Scale for node sizes
        const sizeScale = d3.scaleLinear()
            .domain([
                d3.min(nodes.map(n => centrality[n.id] || 0)), 
                d3.max(nodes.map(n => centrality[n.id] || 0))
            ])
            .range([5, 20]);

        // Scale for node colors
        const colorScale = d3.scaleSequential()
            .domain([
                d3.min(nodes.map(n => centrality[n.id] || 0)), 
                d3.max(nodes.map(n => centrality[n.id] || 0))
            ])
            .interpolator(d3.interpolateViridis);

        // Update nodes
        node
            .attr('r', d => centralityMeasure === 'no-centrality' ? 5 : sizeScale(centrality[d.id] || 0))
            .style('fill', d => centralityMeasure === 'no-centrality' ? 
                getNodeColor(d) : 
                colorScale(centrality[d.id] || 0));
    }

    // Create the force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-30))  // Reduced repulsion
        .force('center', d3.forceCenter(width / 2, height / 2))
        // Add forces to help position isolated nodes
        .force('x', d3.forceX(width / 2).strength(node => {
            // Stronger x-force for isolated nodes
            return isIsolated(node) ? 0.05 : 0.01;
        }))
        .force('y', d3.forceY(height / 2).strength(node => {
            // Stronger y-force for isolated nodes
            return isIsolated(node) ? 0.05 : 0.01;
        }))
        // Prevent overlap
        .force('collision', d3.forceCollide().radius(8));

    // Helper function to check if a node is isolated
    function isIsolated(node) {
        return !links.some(link => 
            link.source.id === node.id || link.target.id === node.id
        );
    }

    // Draw the links
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'link');
    
    // Draw the nodes
    const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('class', 'node')
        .attr('r', 5)
        .style('fill', getNodeColor)  // Use the new color function
        .call(drag(simulation));
    
    // Add node dragging behavior
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Update positions on each tick of the simulation
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

    // Add event listener for centrality measure selection
    d3.select('#centrality-select').on('change', function() {
        updateVisualization(this.value);
    });
}

// Call the function when the page loads
createNetworkVisualization(); 