import types.Grafo;

public class App {
    public static void main(String[] args) throws Exception {
    }

    // Salvando o primeiro grafo
    public void exercicio_23_03_1() {
        Grafo grafo = new Grafo("1", "2", "3", "4", "5", "6", "7");
        try {
            grafo.addEdge("1", "2");
            grafo.addEdge("1", "3");

            grafo.addEdge("2", "1");
            grafo.addEdge("2", "4");
            grafo.addEdge("2", "6");
            grafo.addEdge("2", "7");

            grafo.addEdge("3", "1");
            grafo.addEdge("3", "7");
            grafo.addEdge("3", "5");
            grafo.addEdge("3", "6");

            grafo.addEdge("4", "2");
            grafo.addEdge("4", "6");

            grafo.addEdge("5", "3");
            grafo.addEdge("5", "7");

            grafo.addEdge("6", "2");
            grafo.addEdge("6", "3");
            grafo.addEdge("6", "4");
            grafo.addEdge("6", "7");

            grafo.addEdge("7", "2");
            grafo.addEdge("7", "3");
            grafo.addEdge("7", "5");
            grafo.addEdge("7", "6");
        } catch (Exception e) {
            System.err.println("Error adding edges");
        }
    }

    // Transformando Lista em grafo
    public void exercicio_23_03_2() {
        Grafo grafo = new Grafo("1", "2", "3", "4", "5", "6");
        // grafo.addVertice("1");
        // grafo.addVertice("2");
        // grafo.addVertice("3");
        // grafo.addVertice("4");
        // grafo.addVertice("5");
        // grafo.addVertice("6");
        try {
            grafo.addEdge("1", "2");
            grafo.addEdge("2", "3");
            grafo.addEdge("3", "4");
            grafo.addEdge("3", "5");
            grafo.addEdge("3", "6");
        } catch (Exception e) {
            System.err.println("Error adding edges");
        }
    }

    // Salvando o segundo grafo
    public void exercicio_23_03_3() {
        Grafo grafo = new Grafo("0", "1", "2", "3", "4", "5", "6", "7", "8");
        try {
            grafo.addEdge("0", "0");
            grafo.addEdge("0", "2");

            grafo.addEdge("1", "3");
            grafo.addEdge("1", "3");

            grafo.addEdge("2", "6");

            grafo.addEdge("3", "7");

            // 4 -> null

            // 5 -> null

            grafo.addEdge("6", "0");
            grafo.addEdge("6", "2");
            grafo.addEdge("6", "4");

            // 7 -> null

            grafo.addEdge("8", "5");
        } catch (Exception e) {
            System.err.println("Error adding edges");
        }
    }
}
