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

    # Calculate degree centrality
    degree = nx.degree_centrality(G)
    with open("degree.json", "w") as f:
        json.dump(dict(degree), f, indent=2)
    print("Degree done")

    # Calculate eigenvector centrality with increased max_iter

    eigen = nx.eigenvector_centrality_numpy(G, max_iter=2000)
    with open("eigen.json", "w") as f:
        json.dump(dict(eigen), f, indent=2)
    print("Eigen done")


    # Calculate katz centrality
    katz = nx.katz_centrality_numpy(G)
    with open("katz.json", "w") as f:
        json.dump(dict(katz), f, indent=2)
    print("Katz done")

    # Calculate pagerank
    pagerank = nx.pagerank(G)
    with open("pagerank.json", "w") as f:
        json.dump(dict(pagerank), f, indent=2)
    print("Pagerank done")

    # Calculate betweenness centrality
    betweenness = nx.betweenness_centrality(G)
    with open("betweenness.json", "w") as f:
        json.dump(dict(betweenness), f, indent=2)
    print("Betweenness done")

    # Calculate closeness centrality
    closeness = nx.closeness_centrality(G)
    with open("closeness.json", "w") as f:
        json.dump(dict(closeness), f, indent=2)
    print("Closeness done")

    # Calculate local clustering coefficient
    clustering = nx.clustering(G)
    with open("clustering.json", "w") as f:
        json.dump(dict(clustering), f, indent=2)
    print("Clustering done")

except FileNotFoundError:
    print("Error: network.txt file not found")
except Exception as e:
    print(f"Error occurred: {str(e)}")
