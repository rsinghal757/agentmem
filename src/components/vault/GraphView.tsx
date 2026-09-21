"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVaultGraph } from "@/hooks/useVaultGraph";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/types/vault";
import { Share2 } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  concept: "#3f90ce",
  person: "#67ad69",
  project: "#c08a4e",
  decision: "#b3a252",
  daily: "#8e948e",
  fleeting: "#9677a8",
  reference: "#5f95a1",
  "core-memory": "#c0666b",
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
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const router = useRouter();

  const renderGraph = useCallback(
    (graphNodes: GraphNode[], graphEdges: GraphEdge[]) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      if (!svgRef.current || graphNodes.length === 0) return;

      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      const simNodes: SimNode[] = graphNodes.map((n) => ({ ...n }));
      const simLinks: SimLink[] = graphEdges
        .filter((e) => {
          const sourceExists = simNodes.some((n) => n.id === e.source);
          const targetExists = simNodes.some((n) => n.id === e.target);
          return sourceExists && targetExists;
        })
        .map((e) => ({ ...e }));

      const simulation = d3
        .forceSimulation(simNodes)
        .force(
          "link",
          d3
            .forceLink<SimNode, SimLink>(simLinks)
            .id((d) => d.id)
            .distance(92),
        )
        .force("charge", d3.forceManyBody().strength(-220))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(32));

      simulationRef.current = simulation;

      const g = svg.append("g");

      (svg as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => {
            g.attr("transform", event.transform);
          }),
      );

      const link = g
        .append("g")
        .selectAll("line")
        .data(simLinks)
        .join("line")
        .style("stroke", "var(--border-strong)")
        .style("stroke-width", 1);

      const node = g
        .append("g")
        .selectAll<SVGCircleElement, SimNode>("circle")
        .data(simNodes)
        .join("circle")
        .attr("r", (d) => Math.log(d.backlinks + 1) * 8 + 4)
        .style("fill", (d) => TYPE_COLORS[d.type || "concept"] || TYPE_COLORS.concept)
        .style("stroke", "var(--card)")
        .style("stroke-width", 2)
        .style("cursor", "pointer")
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

      const label = g
        .append("g")
        .selectAll("text")
        .data(simNodes)
        .join("text")
        .text((d) => d.title || d.id.split("/").pop()?.replace(".md", "") || "")
        .attr("font-size", 10.5)
        .attr("text-anchor", "middle")
        .attr("dy", (d) => Math.log(d.backlinks + 1) * 8 + 17)
        .attr("pointer-events", "none")
        .style("fill", "var(--text-muted)")
        .style("font-family", "var(--font-sans)");

      node
        .append("title")
        .text(
          (d) =>
            `${d.title || d.id}\nType: ${d.type || "unknown"}\nTags: ${d.tags.join(", ") || "none"}\nBacklinks: ${d.backlinks}`,
        );

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
        simulationRef.current = null;
      };
    },
    [router],
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    return renderGraph(nodes, edges);
  }, [nodes, edges, renderGraph]);

  // The centre pane resizes whenever a side pane is docked or hidden.
  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      const simulation = simulationRef.current;
      if (!simulation) return;
      simulation.force(
        "center",
        d3.forceCenter(element.clientWidth / 2, element.clientHeight / 2),
      );
      simulation.alpha(0.3).restart();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-faint)]">
        Mapping your vault…
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <Share2 className="h-7 w-7 text-[var(--text-faint)]" strokeWidth={1.25} />
        <p className="mt-4 font-serif text-[20px] text-[var(--text-strong)]">
          Nothing is linked yet.
        </p>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
          Wrap a note name in double brackets — <span className="font-mono">[[like this]]</span>{" "}
          — and it will show up here as an edge.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg ref={svgRef} className="h-full w-full" aria-label="Interactive knowledge graph" />

      <div className="pointer-events-none absolute left-5 right-5 top-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[22px] leading-tight tracking-[-0.02em] text-[var(--text-strong)]">
            Connections
          </h1>
          <p className="mt-1 text-[12px] text-[var(--text-faint)]">
            Drag to rearrange · scroll to zoom · click a node to open it
          </p>
        </div>
        <span className="sq-control shrink-0 border border-border bg-card/85 px-2 py-1 text-[11px] tabular-nums text-[var(--text-muted)] backdrop-blur">
          {nodes.length} notes · {edges.length} links
        </span>
      </div>

      <div className="sq-card absolute bottom-5 left-5 border border-border bg-card/85 px-3 py-2.5 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="eyebrow mb-2">Note types</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] capitalize text-[var(--text-muted)]">
                {type.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
