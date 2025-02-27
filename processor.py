import networkx as nx
import json
import numpy as np


# Create an empty undirected graph
G = nx.Graph()

# Read edges from network.txt
try:
    with open('network.txt', 'r') as file:
        for line in file:
            # Split each line into two nodes and remove whitespace
            node1, node2 = line.strip().split()
            # Add edge to the graph
            G.add_edge(node1, node2)
    
    # Print basic information about the graph
    print(f"Number of nodes: {G.number_of_nodes()}")
    print(f"Number of edges: {G.number_of_edges()}")

    degree = nx.degree_centrality(G)
    with open("degree.json", "w") as f:
        json.dump(dict(degree), f, indent=2)

    print("Degree done")

    eigen = nx.eigenvector_centrality(G)
    with open("eigen.json", "w") as f:
        json.dump(dict(eigen), f, indent=2)
    
    print("Eigen done")

    katz = nx.katz_centrality(G)
    with open("katz.json", "w") as f:
        json.dump(dict(katz), f, indent=2)
    
    print("Katz done")

    pagerank = nx.pagerank(G)
    with open("pagerank.json", "w") as f:
        json.dump(dict(pagerank), f, indent=2)

    print("Pagerank done")

except FileNotFoundError:
    print("Error: network.txt file not found")
except Exception as e:
    print(f"Error occurred: {str(e)}")
