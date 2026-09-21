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

const LABEL_SIZE = 10.5;
/** Room the header, the legend and the counter chip need to stay clear of nodes. */
const FIT_INSET = { top: 78, right: 28, bottom: 96, left: 28 };

function nodeRadius(d: SimNode) {
  return Math.log(d.backlinks + 1) * 8 + 4;
}

function nodeLabel(d: SimNode) {
  return d.title || d.id.split("/").pop()?.replace(".md", "") || "";
}

/** Inter at 10.5px averages a little over half the font size per glyph. */
function labelHalfWidth(d: SimNode) {
  return (nodeLabel(d).length * LABEL_SIZE * 0.53) / 2;
}

export function GraphView() {
  const { nodes, edges, isLoading } = useVaultGraph();
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
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

      // Spacing is derived from the pane so a handful of notes spreads out
      // instead of balling up in the middle of an empty canvas.
      const spacing = Math.sqrt((width * height) / Math.max(simNodes.length, 4));

      const simulation = d3
        .forceSimulation(simNodes)
        .force(
          "link",
          d3
            .forceLink<SimNode, SimLink>(simLinks)
            .id((d) => d.id)
            .distance(Math.max(80, spacing * 0.6)),
        )
        .force("charge", d3.forceManyBody().strength(-Math.max(200, spacing * 2.2)))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collision",
          // Reserve the label's own width so titles do not print over each other.
          d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 10 + Math.min(labelHalfWidth(d), 46)),
        )
        // Settled headlessly further down so the graph never appears mid-tangle.
        .stop();

      simulationRef.current = simulation;

      const g = svg.append("g");

      const svgSelection = svg as unknown as d3.Selection<
        SVGSVGElement,
        unknown,
        null,
        undefined
      >;

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svgSelection.call(zoom);

      /** Frame the settled layout inside the pane, clear of the overlaid chrome. */
      const fitToViewport = (animate: boolean) => {
        const element = svgRef.current;
        if (!element) return;

        const paneWidth = element.clientWidth - FIT_INSET.left - FIT_INSET.right;
        const paneHeight = element.clientHeight - FIT_INSET.top - FIT_INSET.bottom;
        if (paneWidth <= 0 || paneHeight <= 0) return;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const d of simNodes) {
          const x = d.x ?? 0;
          const y = d.y ?? 0;
          const extent = Math.max(nodeRadius(d), labelHalfWidth(d));
          minX = Math.min(minX, x - extent);
          maxX = Math.max(maxX, x + extent);
          minY = Math.min(minY, y - nodeRadius(d));
          // Labels hang below their node.
          maxY = Math.max(maxY, y + nodeRadius(d) + LABEL_SIZE + 8);
        }

        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        if (!Number.isFinite(graphWidth) || graphWidth <= 0 || graphHeight <= 0) return;

        const scale = Math.min(1.6, paneWidth / graphWidth, paneHeight / graphHeight);
        const transform = d3.zoomIdentity
          .translate(
            FIT_INSET.left + paneWidth / 2 - (scale * (minX + maxX)) / 2,
            FIT_INSET.top + paneHeight / 2 - (scale * (minY + maxY)) / 2,
          )
          .scale(scale);

        if (animate) {
          svgSelection.transition().duration(450).call(zoom.transform, transform);
        } else {
          svgSelection.call(zoom.transform, transform);
        }
      };

      fitRef.current = () => fitToViewport(true);

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
        .attr("r", nodeRadius)
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
        .text(nodeLabel)
        .attr("font-size", LABEL_SIZE)
        .attr("text-anchor", "middle")
        .attr("dy", (d) => nodeRadius(d) + 13)
        .attr("pointer-events", "none")
        .style("fill", "var(--text-muted)")
        .style("font-family", "var(--font-sans)");

      node
        .append("title")
        .text(
          (d) =>
            `${d.title || d.id}\nType: ${d.type || "unknown"}\nTags: ${d.tags.join(", ") || "none"}\nBacklinks: ${d.backlinks}`,
        );

      const draw = () => {
        link
          .attr("x1", (d) => (d.source as SimNode).x || 0)
          .attr("y1", (d) => (d.source as SimNode).y || 0)
          .attr("x2", (d) => (d.target as SimNode).x || 0)
          .attr("y2", (d) => (d.target as SimNode).y || 0);

        node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);
        label.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);
      };

      simulation.on("tick", draw);

      // Run the layout to rest before the first paint, then frame it. Watching
      // a force graph unwind from a knot is noise, not information.
      simulation.tick(300);
      draw();
      fitToViewport(false);
      // Hand the simulation back to the ticker so dragging stays live.
      simulation.restart();

      return () => {
        simulation.stop();
        simulationRef.current = null;
        fitRef.current = null;
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
      fitRef.current?.();
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
