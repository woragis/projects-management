package types;

public class Edge {
    private String vertex1;
    private String vertex2;

    public Edge(String vertex1, String vertex2) {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
    }

    public String getVertex1() {
        return vertex1;
    }

    public void setVertex1(String vertex1) {
        this.vertex1 = vertex1;
    }

    public String getVertex2() {
        return vertex2;
    }

    public void setVertex2(String vertex2) {
        this.vertex2 = vertex2;
    }

}
