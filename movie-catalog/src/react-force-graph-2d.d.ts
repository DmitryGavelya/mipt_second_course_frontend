declare module 'react-force-graph-2d' {
    import { FC } from 'react';

    interface GraphData {
        nodes: any[];
        links: any[];
    }

    interface ForceGraph2DProps {
        graphData: GraphData;
        nodeLabel?: (node: any) => string;
        nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
        linkCanvasObject?: (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
        onNodeClick?: (node: any) => void;
        nodeColor?: (node: any) => string;
        linkColor?: (link: any) => string;
        linkWidth?: number;
        backgroundColor?: string;
        width?: number;
        height?: number;
        cooldownTicks?: number;
        onEngineStop?: () => void;
    }

    const ForceGraph2D: FC<ForceGraph2DProps>;
    export default ForceGraph2D;
}

