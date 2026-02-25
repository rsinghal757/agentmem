"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVaultGraph } from "@/hooks/useVaultGraph";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types/vault";

const TYPE_COLORS: Record<string, string> = {
  concept: "#8b5cf6",     // violet
  person: "#22c55e",      // green
  project: "#f97316",     // orange
  decision: "#eab308",    // yellow
  daily: "#9ca3af",       // gray
  fleeting: "#a855f7",    // purple
  reference: "#06b6d4",   // cyan
  "core-memory": "#ef4444", // red
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  title: string | null;
  type: string | null;
  tags: string[];
  backlinks: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

export function GraphView() {
  const { nodes, edges, isLoading } = useVaultGraph();
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const renderGraph = useCallback(
    (graphNodes: GraphNode[], graphEdges: GraphEdge[]) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      if (!svgRef.current || graphNodes.length === 0) return;

      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      // Create simulation data
      const simNodes: SimNode[] = graphNodes.map((n) => ({ ...n }));
      const simLinks: SimLink[] = graphEdges
        .filter((e) => {
          const sourceExists = simNodes.some((n) => n.id === e.source);
          const targetExists = simNodes.some((n) => n.id === e.target);
          return sourceExists && targetExists;
        })
        .map((e) => ({ ...e }));

      // Force simulation
      const simulation = d3
        .forceSimulation(simNodes)
        .force(
          "link",
          d3
            .forceLink<SimNode, SimLink>(simLinks)
            .id((d) => d.id)
            .distance(80),
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));

      // Zoom
      const g = svg
        .append("g");

      (svg as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => {
            g.attr("transform", event.transform);
          }),
      );

      // Links
      const link = g
        .append("g")
        .selectAll("line")
        .data(simLinks)
        .join("line")
        .attr("stroke", "#D1D5DB")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.8);

      // Nodes
      const node = g
        .append("g")
        .selectAll<SVGCircleElement, SimNode>("circle")
        .data(simNodes)
        .join("circle")
        .attr("r", (d) => Math.log(d.backlinks + 1) * 8 + 4)
        .attr("fill", (d) => TYPE_COLORS[d.type || "concept"] || "#8b5cf6")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("click", (_event, d) => {
          router.push(`/vault/${d.id}`);
        })
        .call(
          d3
            .drag<SVGCircleElement, SimNode>()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }),
        );

      // Labels
      const label = g
        .append("g")
        .selectAll("text")
        .data(simNodes)
        .join("text")
        .text((d) => d.title || d.id.split("/").pop()?.replace(".md", "") || "")
        .attr("font-size", 10)
        .attr("fill", "#6B6B6B")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => Math.log(d.backlinks + 1) * 8 + 16)
        .attr("pointer-events", "none");

      // Tooltip on hover
      node
        .append("title")
        .text(
          (d) =>
            `${d.title || d.id}\nType: ${d.type || "unknown"}\nTags: ${d.tags.join(", ") || "none"}\nBacklinks: ${d.backlinks}`,
        );

      // Tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as SimNode).x || 0)
          .attr("y1", (d) => (d.source as SimNode).y || 0)
          .attr("x2", (d) => (d.target as SimNode).x || 0)
          .attr("y2", (d) => (d.target as SimNode).y || 0);

        node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);

        label.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);
      });

      return () => {
        simulation.stop();
      };
    },
    [router],
  );

  useEffect(() => {
    if (nodes.length > 0) {
      const cleanup = renderGraph(nodes, edges);
      return cleanup;
    }
  }, [nodes, edges, renderGraph]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Loading graph...
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 text-4xl">🕸️</div>
        <p className="text-sm text-gray-500">No notes in the vault yet.</p>
        <p className="text-xs text-gray-400">
          Start chatting to build your knowledge graph!
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        className="h-full w-full"
        style={{ background: "#FAFAFA", borderRadius: "0" }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="mb-2 text-xs font-semibold text-gray-500">
          Node Types
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize text-gray-500">
                {type.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
