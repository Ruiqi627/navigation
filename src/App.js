import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import './App.css'; 


// 设置Mapbox访问令牌
mapboxgl.accessToken = 'pk.eyJ1IjoicmxpdTEyMyIsImEiOiJjbTF0cDN6emYwNTRiMmtwYjBubXlxcDFkIn0.LTfoY5Cq0TTDeEi5cNSk7w';

const App = () => {
  const mapContainerRef = useRef(null);
  const [routeData, setRouteData] = useState(null);  // 存储route.json数据

  const [types, setTypes] = useState([]); // 存储不同的type种类
  const [showDirections, setShowDirections] = useState(false); // 控制路径导航组件的显示
  const [isSelectingStart, setIsSelectingStart] = useState(false); // 是否正在选择起点
  const [isSelectingEnd, setIsSelectingEnd] = useState(false); // 是否正在选择终点
  const [startPoint, setStartPoint] = useState(null); // 起点坐标
  const [startName, setStartName] = useState(null); // 起点
  const [endPoint, setEndPoint] = useState(null); // 终点坐标
  const [endName, setEndName] = useState(null); // 起点
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const [graph, setGraph] = useState({});



  useEffect(() => {
    var map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-zh-v1', 
      center: [103.8509077,1.4238672], 
      zoom: 18, 
    });

    map.on('load', () => {
     // 楼梯数据源，添加多个紧密间隔的台阶
map.addSource('detailed-stairs', {
  'type': 'geojson',
  'data': {
      'type': 'FeatureCollection',
      'features': []
  }
});

// 设定台阶数量
const stairCount = 15; // 设定台阶数量为15
const stepHeight = 0.15; // 每个台阶的高度
const stepDepth = 0.000005; // 每个台阶的深度
const stepWidth = 0.00003; // 调窄后的台阶宽度
const baseLongitude1 = 103.8507733; // 第一个楼梯的经度
const baseLatitude1 = 1.4242372; // 第一个楼梯的纬度
const baseLongitude2 = 103.8507733; // 第二个楼梯的经度
const baseLatitude2 = 1.4242372 - 0.00009; // 第二个楼梯的纬度（向下移动一点）
const overallHeightIncrease = 0.5; // 整体高度增加的值

// 添加第一个楼梯
for (let i = 0; i < stairCount; i++) {
  const baseHeight = (i * stepHeight) + overallHeightIncrease; // 加上整体高度
  const coordinates = [
      [
          [baseLongitude1 + (i * stepDepth), baseLatitude1 - stepWidth], // 左边
          [baseLongitude1 + (i * stepDepth), baseLatitude1 + stepWidth], // 右边
          [baseLongitude1 + ((i + 1) * stepDepth), baseLatitude1 + stepWidth], // 右边上
          [baseLongitude1 + ((i + 1) * stepDepth), baseLatitude1 - stepWidth], // 左边上
          [baseLongitude1 + (i * stepDepth), baseLatitude1 - stepWidth] // 闭合多边形
      ]
  ];

  // 添加每个台阶到数据源
  const currentData = map.getSource('detailed-stairs')._data.features;

  map.getSource('detailed-stairs').setData({
      'type': 'FeatureCollection',
      'features': [
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Polygon',
                  'coordinates': coordinates
              },
              'properties': {
                  'base_height': baseHeight,
                  'height': baseHeight + stepHeight // 增加高度
              }
          },
          ...currentData // 继续添加其他特征
      ]
  });
}

// 添加第二个楼梯
for (let i = 0; i < stairCount; i++) {
  const baseHeight = (i * stepHeight) + overallHeightIncrease; // 加上整体高度
  const coordinates = [
      [
          [baseLongitude2 + (i * stepDepth), baseLatitude2 - stepWidth], // 左边
          [baseLongitude2 + (i * stepDepth), baseLatitude2 + stepWidth], // 右边
          [baseLongitude2 + ((i + 1) * stepDepth), baseLatitude2 + stepWidth], // 右边上
          [baseLongitude2 + ((i + 1) * stepDepth), baseLatitude2 - stepWidth], // 左边上
          [baseLongitude2 + (i * stepDepth), baseLatitude2 - stepWidth] // 闭合多边形
      ]
  ];

  // 添加每个台阶到数据源
  const currentData = map.getSource('detailed-stairs')._data.features;

  map.getSource('detailed-stairs').setData({
      'type': 'FeatureCollection',
      'features': [
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Polygon',
                  'coordinates': coordinates
              },
              'properties': {
                  'base_height': baseHeight,
                  'height': baseHeight + stepHeight // 增加高度
              }
          },
          ...currentData // 继续添加其他特征
      ]
  });
}

// 使用 fill-extrusion 图层来创建更精确的楼梯台阶
map.addLayer({
  'id': 'detailed-stairs-layer',
  'type': 'fill-extrusion',
  'source': 'detailed-stairs',
  'paint': {
      'fill-extrusion-color': '#E8E8E8', // 设置楼梯为偏白色
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'base_height'],
      'fill-extrusion-opacity': 0.95
  }
});
    



      map.loadImage('/arrow-icon.png', (error, image) => {
        if (error) throw error;
        map.addImage('arrow-icon', image);
      });
    });


    map.setStyle('mapbox://styles/mapbox/streets-zh-v1', {
      localIdeographFontFamily: "'Noto Sans CJK SC', sans-serif" 
    });


    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;

    mapRef.current.on('style.load', () => {
    fetch('/THC3.geojson') 
      .then((response) => response.json())
      .then((data) => {
        const typeSet = new Set(); 
        data.features.forEach((feature) => {
          const featureType = feature.properties.type;
          if (featureType) {
            typeSet.add(featureType); 
          }
        });

        setTypes([...typeSet]);
        map.addSource('polygon', {
          type: 'geojson',
          data: data,
        });

        map.loadImage('/texture1.png', (error, image) => {
          if (error) throw error;
          map.addImage('texture1', image);
      });

      map.loadImage('/texture2.png', (error, image) => {
        if (error) throw error;
        map.addImage('texture2', image);
    });
    map.loadImage('/texture222.png', (error, image) => {
      if (error) throw error;
      map.addImage('texture222', image);
  });
    

    map.loadImage('/texture3.png', (error, image) => {
      if (error) throw error;
      map.addImage('texture3', image);
  });
  map.loadImage('/texture333.png', (error, image) => {
    if (error) throw error;
    map.addImage('texture333', image);
});
  map.loadImage('/texture4.png', (error, image) => {
    if (error) throw error;
    map.addImage('texture4', image);
});
  map.loadImage('/texture444.png', (error, image) => {
    if (error) throw error;
    map.addImage('texture444', image);
});

map.loadImage('/texture5.png', (error, image) => {
  if (error) throw error;
  map.addImage('texture5', image);
});
map.loadImage('/texture555.png', (error, image) => {
  if (error) throw error;
  map.addImage('texture555', image);
});


map.loadImage('/texture6.png', (error, image) => {
  if (error) throw error;
  map.addImage('texture6', image);
});
map.loadImage('/texture666.png', (error, image) => {
  if (error) throw error;
  map.addImage('texture666', image);
});
map.loadImage('/texture7.png', (error, image) => {
  if (error) throw error;
  map.addImage('texture7', image);
});
    
// map.addLayer({
//   id: 'extruded-polygon-layer',
//   type: 'fill-extrusion',
//   source: 'polygon',
//   filter: ['!=', ['get', 'bdname'], ''],
//   paint: {
//       'fill-extrusion-height': [
//           'case',
//           ['==', ['get', 'bdname'], 'Block B'], 20,
//           10
//       ],
//       'fill-extrusion-opacity': 1,
//       'fill-extrusion-pattern': [
//           'match',
//           ['get', 'bdname'],
//           'Aarush Gore', 'texture7',
//           'Playground', 'texture4',
//           'Block E', 'texture2',
//           'XCL American Academy', 'texture6',
//           'Block B', 'texture5',
//           'XCL World Academy', 'texture1',
//           'Block C', 'texture3',
//           'texture1' // 默认图像
//       ]
//   }
// });

// 添加挤出多边形图层
map.addLayer({
  id: 'extruded-polygon-layer',
  type: 'fill-extrusion',
  source: 'polygon',
  filter: ['!=', ['get', 'bdname'], ''], // 过滤掉 bdname 为空的多边形
  paint: {
      'fill-extrusion-height': [
          'case',
          ['==', ['get', 'bdname'], 'Block B'], 20, // Block B 的高度设为 20
          ['==', ['get', 'id'], '9'], 10, // bdname 为 9 的高度设为 10米
          10 // 其他的高度设为 10
      ],
      'fill-extrusion-base': [
          'case',
          ['==', ['get', 'id'], '9'], 5, // bdname 为 9 的底部悬空高度设为 5米
          0 // 其他的底部高度设为 0（即地面）
      ],
      'fill-extrusion-opacity': 1,
      'fill-extrusion-pattern': [
          'match',
          ['get', 'bdname'],
          'Aarush Gore', 'texture7',
          'Playground', 'texture4',
          'Block E', 'texture2',
          'XCL American Academy', 'texture6',
          'Block B', 'texture5',
          'XCL World Academy', 'texture1',
          'Block C', 'texture3',
          'texture1' // 默认纹理
      ]
  }
});

// 监控缩放事件
map.on('zoom', () => {
  const currentZoom = map.getZoom();
  
  if (currentZoom > 18) {
      // 隐藏纹理图层，保留多边形显示
      map.setPaintProperty('extruded-polygon-layer', 'fill-extrusion-pattern', [
          'match',
          ['get', 'bdname'],
          'Aarush Gore', 'texture7',
          'Playground', 'texture444',
          'Block E', 'texture222',
          'XCL American Academy', 'texture666',
          'Block B', 'texture555',
          'XCL World Academy', 'texture1',
          'Block C', 'texture333',
          'texture1' // 默认图像
      ]);
  } else {
      // 恢复纹理图层显示
      map.setPaintProperty('extruded-polygon-layer', 'fill-extrusion-pattern', [
          'match',
          ['get', 'bdname'],
          'Aarush Gore', 'texture7',
          'Playground', 'texture4',
          'Block E', 'texture2',
          'XCL American Academy', 'texture6',
          'Block B', 'texture5',
          'XCL World Academy', 'texture1',
          'Block C', 'texture3',
          'texture1' // 默认图像
      ]);
  }
});


      
// 添加 symbol 图层来显示 bdname 标签
map.addLayer({
  id: 'bdname-labels',
  type: 'symbol',
  source: 'polygon',
  filter: ['!=', ['get', 'bdname'], ''],
  layout: {
    'text-field': ['get', 'bdname'],
    'text-size': 16,
    'text-anchor': 'center',
    'text-offset': [0, 0.5], // 调整标签的位置
  },
  paint: {
    'text-color': '#000000',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1,
  },
});



      })
      .catch((error) => console.error('Error loading GeoJSON:', error));
    })


    // 清理地图实例
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
  
     const handleMapClick = (e) => {
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: ['extruded-polygon-layer'],
      });
    
      if (features.length > 0) {
        const selectedFeature = features[0]; // 获取第一个特征
        const featureName = selectedFeature.properties.bdname; // 获取特征名称
        const geometry = selectedFeature.geometry;
    
        let centroid;
    
        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
          // 使用 Turf.js 计算几何中心
          centroid = turf.centroid(geometry);
        } else {
          alert('不支持的几何类型'); // 提示不支持的几何类型
          return;
        }
    
        // 获取计算出的中心点坐标
        const [lng, lat] = centroid.geometry.coordinates; // 直接获取中心点坐标
    
        // 处理起点和终点的选择
        if (isSelectingStart) {
          setStartName(featureName);
          setStartPoint([lng, lat]);
          setIsSelectingStart(false);
    
          // 添加起点标记
          if (startMarkerRef.current) {
            startMarkerRef.current.remove(); // 移除之前的起点标记
          }
          startMarkerRef.current = new mapboxgl.Marker({ color: 'red' })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        } else if (isSelectingEnd) {
          setEndName(featureName);
          setEndPoint([lng, lat]);
          setIsSelectingEnd(false);
    
          // 添加终点标记
          if (endMarkerRef.current) {
            endMarkerRef.current.remove(); // 移除之前的终点标记
          }
          endMarkerRef.current = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        }
      } else {
        alert('未选择到任何特征'); // 提示未选择到特征
      }
    };
  
    // 注册地图点击事件
    mapRef.current.on('click', handleMapClick);
  

    // Clean up event listener
    return () => {
      mapRef.current.off('click', handleMapClick); // Remove event listener
    };
  }, [isSelectingStart, isSelectingEnd]);


  //导航
 // 构建图的函数
// 构建图
const buildGraph = (edgeData) => {
  const graph = {};
  const coordCount = {};  // 记录每个坐标点的出现次数

  edgeData.features.forEach(feature => {
      const coords = feature.geometry.coordinates;  // 获取边的坐标
      const distance = feature.properties.distance;  // 获取边的距离
      console.log(distance,'距离')

      // 起点和终点
      const start = coords[0].toString(); 
      const end = coords[coords.length - 1].toString();

      // 统计坐标点的出现次数
      coords.forEach(coord => {
          const coordKey = coord.toString();  // 将坐标转换为字符串
          coordCount[coordKey] = (coordCount[coordKey] || 0) + 1;
      });

      // 确保起点和终点存在于图中
      if (!graph[start]) graph[start] = [];
      if (!graph[end]) graph[end] = [];

      // 连接起点到终点，确保不重复连接
      if (!graph[start].some(neighbor => neighbor.node === end)) {
        graph[start].push({ node: end, weight: distance });
      }
      if (!graph[end].some(neighbor => neighbor.node === start)) {
        graph[end].push({ node: start, weight: distance });
      }
  });

  // 输出出现次数大于2次的坐标点
  console.log('出现超过两次的坐标点：');
  for (const coord in coordCount) {
      if (coordCount[coord] > 2) {
          console.log(`坐标 ${coord} 出现了 ${coordCount[coord]} 次`);
      }
  }

  return graph;
};

// 找到离给定坐标最近的节点
const findClosestNode = (nodes, point) => {
  let closestNode = null;
  let minDistance = Infinity;

  nodes.forEach(node => {
    const [lng, lat] = node.split(',').map(Number); // 将节点字符串解析为坐标
    const distance = turf.distance([lng, lat], point); // 使用Turf.js计算两点间的距离

    if (distance < minDistance) {
      closestNode = node;
      minDistance = distance;
    }
  });

  console.log(closestNode,'closetNode')
  return closestNode;
};

class MinHeap {
  constructor() {
    this.nodes = [];
  }

  insert(node, priority) {
    this.nodes.push({ node, priority });
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.nodes.length - 1;
    const element = this.nodes[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.nodes[parentIndex];

      if (element.priority >= parent.priority) break;

      this.nodes[parentIndex] = element;
      this.nodes[index] = parent;
      index = parentIndex;
    }
  }

  extractMin() {
    if (this.nodes.length === 0) return null;

    const min = this.nodes[0];
    const end = this.nodes.pop();
    if (this.nodes.length > 0) {
      this.nodes[0] = end;
      this.sinkDown();
    }
    return min.node;
  }

  sinkDown() {
    let index = 0;
    const length = this.nodes.length;
    const element = this.nodes[0];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.nodes[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.nodes[rightChildIndex];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;

      this.nodes[index] = this.nodes[swap];
      this.nodes[swap] = element;
      index = swap;
    }
  }

  isEmpty() {
    return this.nodes.length === 0;
  }
}

const dijkstra = (graph, startNode, endNode) => {
  const distances = {};
  const previousNodes = {};
  const priorityQueue = new MinHeap();

  // 初始化所有节点的距离和前驱节点
  for (const node in graph) {
    distances[node] = Infinity;
    previousNodes[node] = null;
  }
  distances[startNode] = 0;
  priorityQueue.insert(startNode, 0);

  while (!priorityQueue.isEmpty()) {
    const currentNode = priorityQueue.extractMin();

    if (currentNode === endNode) {
      break; // 找到目标节点
    }

    graph[currentNode].forEach(neighbor => {
      const newDist = distances[currentNode] + neighbor.weight;
      if (newDist < distances[neighbor.node]) {
        distances[neighbor.node] = newDist;
        previousNodes[neighbor.node] = currentNode;
        priorityQueue.insert(neighbor.node, newDist);
      }
    });
  }

  // 构建路径
  const resultPath = [];
  let currentNode = endNode;
  while (currentNode) {
    resultPath.unshift(currentNode);
    currentNode = previousNodes[currentNode];
  }

  return { distance: distances[endNode] === Infinity ? null : distances[endNode], path: resultPath };
};

// 在组件挂载时读取 GeoJSON 数据并构建图
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/topedge.geojson');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const edgeData = await response.json();
      // 构建图
      const graph = buildGraph(edgeData);
      setGraph(graph);
      console.log(graph,'graph')
    } catch (error) {
      console.error("Error fetching or processing data:", error);
    }
  };

  fetchData();
}, []);

// 在地图上绘制路径
const drawRoute = (path) => {
  const coordinates = path.map(coord => coord.split(',').map(Number));

  // 清除之前的路线图层和数据源
  if (mapRef.current.getSource('route')) {
    mapRef.current.removeLayer('route-pattern');  // 移除带箭头的路线图层
    mapRef.current.removeLayer('route');          // 移除蓝色路线图层
    mapRef.current.removeSource('route');         // 移除路线数据源
  }

  // 添加路线数据源
  mapRef.current.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
    },
  });


  mapRef.current.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#007bff',     
      'line-width': 4,             
    },
  });

  // 加载箭头图标
  mapRef.current.loadImage('/arrow-icon.png', (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('arrow-icon', image); // 添加箭头图标

    // 添加上层：带箭头的路线图案
    mapRef.current.addLayer({
      id: 'route-pattern',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'line-pattern': 'arrow-icon',
      },
      paint: {
        'line-width': 4,              
      },
    });

    // 开始动画效果
    animateArrowPattern();
  });
};

// 动画效果函数
const animateArrowPattern = () => {
  const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5]
  ];

  let step = 0;

  function animateDashArray(timestamp) {
    // 获取新的步骤以更新线条样式
    const newStep = parseInt((timestamp / 50) % dashArraySequence.length);

    // 更新线条的虚线样式
    if (newStep !== step) {
      // 更新带箭头的线条图层的 dasharray
      mapRef.current.setPaintProperty(
        'route-pattern',
        'line-dasharray',
        dashArraySequence[step]
      );
      step = newStep;
    }

    // 循环请求下一个动画帧
    requestAnimationFrame(animateDashArray);
  }

  // 启动动画
  requestAnimationFrame(animateDashArray);
};

// 提交处理函数
const handleSubmit = () => {
  if (!graph || Object.keys(graph).length === 0) {
    alert("图数据未加载或为空");
    return;
  }

  if (!startPoint || !endPoint) {
    alert("请选择起点和终点！");
    return;
  }

  // 找到离用户选定的起点和终点最近的节点
  const startNode = findClosestNode(Object.keys(graph), startPoint);
  const endNode = findClosestNode(Object.keys(graph), endPoint);

  if (!startNode || !endNode) {
    alert("无法找到起点或终点的最近节点！");
    return;
  }

  // 使用Dijkstra算法计算路径
  const result = dijkstra(graph, startNode, endNode);
  console.log(result, 'result');

  // 在地图上绘制路径
  if (result.path.length > 0) {
    drawRoute(result.path);
  }


};


return (
  <div>
    <div ref={mapContainerRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />

    {/* 路径导航按钮 */}
    <button onClick={() => setShowDirections(true)} className="nav-button">
      路径导航
    </button>

    {/* 路径导航组件 */}
    {showDirections && (
      <div className="directions-container">
        {/* 起点选择 */}
        <div className="row">
          <div className="circle red"></div>
          <span className="label-text">起点: {startName || ''}</span>
          <button
            onClick={() => {
              setIsSelectingStart(true);
              setIsSelectingEnd(false); // 停止选择终点
            }}
            className="select-button"
          >
            {'请选择起点'} {/* 始终显示这句话 */}
          </button>
        </div>
        {/* 终点选择 */}
        <div className="row">
          <div className="circle blue"></div>
          <span className="label-text">终点: {endName || ''}</span>
          <button
            onClick={() => {
              setIsSelectingEnd(true);
              setIsSelectingStart(false); // 停止选择起点
            }}
            className="select-button"
          >
            {'请选择终点'} {/* 始终显示这句话 */}
          </button>
        </div>
        {/* 提交按钮 */}
        <button
          onClick={handleSubmit} // 添加点击事件，调用 handleSubmit 函数
          className="submit-button"
        >
          提交
        </button>
      </div>
    )}
  </div>
);
};

export default App;

