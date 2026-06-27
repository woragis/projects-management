package types;

import java.util.ArrayList;

public class Vertex {
    private String name;
    private int degree;
    private ArrayList<String> adjacents;
    private ArrayList<String> adjacentings;

    private int adjacentsCount = 0;
    private int adjacentingsCount = 0;

    public Vertex(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getDegree() {
        return this.degree;
    }

    public void incrementDegree() {
        this.degree++;
    }

    public int getAdjacentsCount() {
        return 0;
    }

    public int getAdjacentingsCount() {
        return 0;
    }

    public void addAdjacent(String name) {
        this.adjacents.add(name);
        this.adjacentsCount++;
    }

    public void addAdjacenting(String name) {
        this.adjacentings.add(name);
        this.adjacentingsCount++;
    }

}
