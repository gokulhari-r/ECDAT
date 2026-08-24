import { Html, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useMemo } from "react";
import type { SpatialCluster, SpatialGraphNode } from "@/lib/spatialProjection";

export type SceneNode = {
  id: string;
  label: string;
  kind: string;
  riskWeight: number;
  position: [number, number, number];
  meta: string;
};

type SceneEdge = {
  source: string;
  target: string;
};

type SpatialSceneProps = {
  clusters: SpatialCluster[];
  graphNodes: SpatialGraphNode[];
  edges: SceneEdge[];
  view: "enterprise" | "domain" | "ecosystem" | "artefact";
  selectedId?: string;
  onSelect: (id: string) => void;
};

const cameraPositions: Record<SpatialSceneProps["view"], [number, number, number]> = {
  enterprise: [0, 0.7, 18],
  domain: [0, 0.5, 15],
  ecosystem: [0, 0.2, 14],
  artefact: [0, 0, 15],
};

function nodeColor(weight: number) {
  if (weight >= 7) return "#fb7185";
  if (weight >= 5) return "#f59e0b";
  if (weight >= 3) return "#22d3ee";
  return "#94a3b8";
}

function layoutRing<T extends { id: string; label: string; kind: string; riskWeight: number }>(items: T[], meta: (item: T) => string): SceneNode[] {
  return items.slice(0, 12).map((item, index, all) => {
    if (index === 0) {
      return { id: item.id, label: item.label, kind: item.kind, riskWeight: item.riskWeight, position: [0, 0, 0], meta: meta(item) };
    }
    const angle = ((index - 1) / Math.max(all.length - 1, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 4.6 + (index % 2) * 0.65;
    return {
      id: item.id,
      label: item.label,
      kind: item.kind,
      riskWeight: item.riskWeight,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 3.3, Math.sin(angle) * 1.1],
      meta: meta(item),
    };
  });
}

function CameraRig({ view }: { view: SpatialSceneProps["view"] }) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(...cameraPositions[view]), [view]);
  useFrame(() => {
    camera.position.lerp(target, 0.055);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SpatialNode({ node, selected, onSelect }: { node: SceneNode; selected: boolean; onSelect: () => void }) {
  const radius = 0.46 + Math.min(node.riskWeight, 8) * 0.055;
  const color = nodeColor(node.riskWeight);
  return (
    <group position={node.position}>
      <mesh onClick={event => { event.stopPropagation(); onSelect(); }}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.62 : 0.22} roughness={0.28} metalness={0.45} />
      </mesh>
      {selected ? <mesh>
        <ringGeometry args={[radius * 1.32, radius * 1.43, 48]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.78} side={2} />
      </mesh> : null}
      <Html center>
        <button type="button" onClick={onSelect} className={`spatial-node-label ${selected ? "spatial-node-label--selected" : ""}`} aria-label={`Focus ${node.label}`}>
          <span>{node.kind}</span>
          <strong>{node.label}</strong>
          <small>{node.meta}</small>
        </button>
      </Html>
    </group>
  );
}

function SceneContents({ clusters, graphNodes, edges, view, selectedId, onSelect }: SpatialSceneProps) {
  const nodes = useMemo(() => {
    if (view === "enterprise") {
      return layoutRing(
        clusters.map(cluster => ({ ...cluster, kind: "cluster" })),
        cluster => `${cluster.assetCount} observed assets · ${cluster.vulnerableCount} quantum-vulnerable`
      );
    }
    return layoutRing(graphNodes, node => `${node.kind} · ${node.findingKeys.length || 1} evidence link${node.findingKeys.length === 1 ? "" : "s"}`);
  }, [clusters, graphNodes, view]);
  const nodeMap = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes]);
  const visibleEdges = useMemo(() => edges.filter(edge => nodeMap.has(edge.source) && nodeMap.has(edge.target)).slice(0, 30), [edges, nodeMap]);

  return (
    <>
      <color attach="background" args={["#06101c"]} />
      <fog attach="fog" args={["#06101c", 11, 27]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[0, 5, 8]} intensity={45} color="#67e8f9" distance={24} />
      <pointLight position={[-8, -3, 5]} intensity={24} color="#a78bfa" distance={20} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.35, 0]}>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#071423" metalness={0.7} roughness={0.7} />
      </mesh>
      <gridHelper args={[30, 30, "#164e63", "#0f2740"]} position={[0, -4.3, 0]} />
      {visibleEdges.map(edge => {
        const source = nodeMap.get(edge.source)!;
        const target = nodeMap.get(edge.target)!;
        const active = selectedId === edge.source || selectedId === edge.target;
        return <Line key={`${edge.source}:${edge.target}`} points={[source.position, target.position]} color={active ? "#a5f3fc" : "#26617b"} lineWidth={active ? 1.6 : 0.7} transparent opacity={active ? 0.95 : 0.38} />;
      })}
      {nodes.map(node => <SpatialNode key={node.id} node={node} selected={node.id === selectedId} onSelect={() => onSelect(node.id)} />)}
      <CameraRig view={view} />
      <OrbitControls enablePan={false} minDistance={7} maxDistance={23} autoRotate={view === "enterprise" && !selectedId} autoRotateSpeed={0.3} />
    </>
  );
}

export function SpatialScene(props: SpatialSceneProps) {
  return (
    <Canvas dpr={[1, 1.6]} gl={{ antialias: true, alpha: false }} className="h-full w-full" aria-label="Interactive ECDAT spatial environment">
      <PerspectiveCamera makeDefault position={cameraPositions.enterprise} fov={41} />
      <SceneContents {...props} />
    </Canvas>
  );
}
