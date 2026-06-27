package types;

import java.util.ArrayList;

public class Grafo {
    private ArrayList<Vertex> vertex;
    private ArrayList<Edge> edges;
    private boolean directional;

    private int vertexCount = 0; // Quantidade de vertices
    private int edgesCount = 0; // Quantidade de arestas

    public Grafo() {
        this.vertex = new ArrayList<Vertex>();
        vertexCount = 0;
    }

    public Grafo(Vertex... vertices) {
        for (int index = 0; index < vertices.length; index++) {
            this.vertex.add(vertices[index]);
            vertexCount++;
        }
    }

    public Grafo(String... vertexNames) {
        for (String vertex : vertexNames) {
            this.vertex.add(new Vertex(vertex));
            vertexCount++;
        }
    }

    public void addEdge(String vertex1, String vertex2) throws Exception {
        boolean v1Found = false;
        boolean v2Found = false;
        for (Vertex vertex : this.vertex) {
            if (vertex1 == vertex.getName()) {
                v1Found = true;
            } else if (vertex2 == vertex.getName()) {
                v2Found = true;
            }
        }
        if (v1Found && v2Found) {
            this.edges.add(new Edge(vertex1, vertex2));
        } else {
            throw new Exception("One of the vertex is not valid!");
        }
    }

    public void removeEdge(String vertex1, String vertex2) throws Exception {
        boolean edgeFound = false;
        for (int i = 0; i < this.edges.size(); i++) {
            if (this.edges.get(i).getVertex1() == vertex1 && this.edges.get(i).getVertex2() == vertex2) {
                edgeFound = true;
                this.edges.remove(i);
            }
        }
        if (!edgeFound) {
            throw new Exception("Edge not found.");
        }
    }

    public void addVertice(String name) {
        this.vertex.add(new Vertex(name));
        vertexCount++;
    }

    public void removeVertice(String name) throws Exception {
        int position = this.vertexPosition(name);
        if (position != -1) {
            this.vertex.remove(position);
            vertexCount--;
        } else {
            throw new Exception("Vertex " + name + " not found!");
        }
    }

    public int vertexPosition(String name) {
        for (int i = 0; i < this.vertex.size(); i++) {
            if (this.vertex.get(i).getName() == name) {
                return i;
            }
        }
        return -1;
    }

    public void setDirectional() {
        this.directional = true;
    }

    public void setBidirectional() {
        this.directional = false;
    }

    public void toggleDirectional() {
        this.directional = !this.directional;
    }

}
