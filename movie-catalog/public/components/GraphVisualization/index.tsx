import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, GraphNode } from '../../pages/GraphPage';

interface GraphVisualizationProps {
    data: GraphData;
    onAddToGraph?: (id: number) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onAddToGraph }) => {
    const graphRef = useRef<any>();
    const navigate = useNavigate();
    const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());

    useEffect(() => {
        if (graphRef.current) {
            // Настройка сил для лучшего расположения узлов
            graphRef.current.d3Force('charge').strength(-400);  // Отталкивание между узлами
            graphRef.current.d3Force('link').distance(150);     // Длина связей
            graphRef.current.d3Force('center').strength(0.05);  // Центрирование

            // Центрируем после построения
            setTimeout(() => {
                graphRef.current?.zoomToFit(400, 50);
            }, 500);
        }
    }, [data]);

    // Предзагрузка изображений
    useEffect(() => {
        const newImages = new Map<string, HTMLImageElement>();
        let loadedCount = 0;
        let errorCount = 0;
        const totalImages = data.nodes.filter(n => n.image).length;

        console.log(`🖼️ Начинаем загрузку ${totalImages} изображений для графа`);

        data.nodes.forEach(node => {
            if (node.image) {
                const img = new Image();
                // Убираем crossOrigin для лучшей совместимости
                // img.crossOrigin = 'anonymous';

                img.onload = () => {
                    loadedCount++;
                    console.log(`✅ Загружено изображение ${loadedCount}/${totalImages}: ${node.name} (${node.type})`);
                    newImages.set(node.id, img);

                    // Обновляем состояние для перерисовки
                    setImages(new Map(newImages));
                };

                img.onerror = (e) => {
                    errorCount++;
                    console.error(`❌ Ошибка загрузки изображения ${errorCount}: ${node.name}`, node.image, e);
                    // При ошибке НЕ добавляем изображение в map
                };

                img.src = node.image;
                console.log(`📥 Загружаем: ${node.name} (${node.type}) - ${node.image}`);
            }
        });

        // Устанавливаем пустую карту сначала
        if (totalImages === 0) {
            setImages(new Map());
        }
    }, [data.nodes]);

    const handleNodeClick = (node: any, event: MouseEvent) => {
        const graphNode = node as GraphNode;

        // Ctrl/Cmd + клик = добавить связи в граф
        if (event.ctrlKey || event.metaKey) {
            if (onAddToGraph) {
                onAddToGraph(graphNode.numericId);
            }
        } else {
            // Обычный клик = переход на страницу
            if (graphNode.type === 'movie') {
                navigate(`/movie/${graphNode.numericId}`);
            } else {
                navigate(`/actor/${graphNode.numericId}`);
            }
        }
    };

    const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const graphNode = node as GraphNode;
        const label = graphNode.name;
        const isActor = graphNode.type === 'actor';
        const img = images.get(graphNode.id);

        const size = 50;  // Увеличенный размер узла
        const fontSize = Math.max(12, 16 / globalScale);  // Минимальный размер шрифта

        ctx.save();

        // Если есть изображение - рисуем его
        if (img && img.complete && img.naturalWidth > 0) {
            // Круглое обрезание
            ctx.beginPath();
            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();

            // Рисуем изображение
            ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);

            ctx.restore();
            ctx.save();

            // Обводка
            ctx.beginPath();
            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = isActor ? '#e50914' : '#4caf50';
            ctx.lineWidth = 4;
            ctx.stroke();
        } else {
            // Если нет изображения - цветной круг с иконкой
            // Логируем только первые несколько раз
            if (Math.random() < 0.01) {
                console.log(`⚠️ Нет изображения для узла: ${label} (${graphNode.type})`, {
                    hasImg: !!img,
                    complete: img?.complete,
                    naturalWidth: img?.naturalWidth,
                    nodeId: graphNode.id
                });
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = isActor ? '#e50914' : '#4caf50';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Эмодзи иконка
            ctx.font = `${size * 0.5}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(isActor ? '👤' : '🎬', node.x, node.y);
        }

        ctx.restore();

        // Текст с фоном - показываем только при достаточном зуме
        if (globalScale > 0.4) {
            // Обрезаем длинные названия
            let displayLabel = label;
            if (label.length > 20) {
                displayLabel = label.substring(0, 18) + '...';
            }

            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            const textY = node.y + size / 2 + 10;
            const textWidth = ctx.measureText(displayLabel).width;
            const padding = 10;

            // Фон для текста
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.beginPath();
            ctx.roundRect(
                node.x - textWidth / 2 - padding,
                textY - 4,
                textWidth + padding * 2,
                fontSize + 10,
                6
            );
            ctx.fill();

            // Текст
            ctx.fillStyle = '#ffffff';
            ctx.fillText(displayLabel, node.x, textY);
        }
    };

    const paintLink = (link: any, ctx: CanvasRenderingContext2D) => {
        const start = link.source;
        const end = link.target;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    return (
        <div className="graph-visualization">
            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                nodeLabel={(node: any) => {
                    const n = node as GraphNode;
                    return `${n.name} (${n.type === 'actor' ? 'Актёр' : 'Фильм'})\n\nКлик → Открыть страницу\nCtrl+Клик → Добавить связи`;
                }}
                nodeCanvasObject={paintNode}
                linkCanvasObject={paintLink}
                onNodeClick={handleNodeClick}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
                    ctx.fill();
                }}
                linkColor={() => 'rgba(255, 255, 255, 0.3)'}
                linkWidth={2}
                backgroundColor="#0a0a0a"
                width={window.innerWidth - 100}
                height={650}
                cooldownTicks={200}
                onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.2}
                nodeRelSize={40}
                d3AlphaMin={0.001}
                warmupTicks={100}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={0.003}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                minZoom={0.3}
                maxZoom={5}
            />

            <div className="graph-visualization__mini-legend">
                <span style={{color: '#e50914'}}>●</span> Актёр &nbsp;&nbsp;
                <span style={{color: '#4caf50'}}>●</span> Фильм
            </div>
        </div>
    );
};

export default GraphVisualization;

