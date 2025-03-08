import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const flowData = {
  "0.4": [23.56, 52.69, 74.51, 91.26, 105.38, 117.82, 129.06, 139.4, 149.03, 158.07, 166.62, 174.75, 182.52, 189.97, 197.14, 204.06, 210.76, 217.24, 223.54, 229.67, 235.63, 241.45, 247.13],
  "0.5": [38.08, 85.15, 120.42, 147.49, 170.3, 190.41, 208.58, 225.29, 240.85, 255.46, 269.27, 282.42, 294.97, 307.02, 318.61, 329.79, 340.61, 351.09, 361.27, 371.17, 380.81, 390.21, 399.4],
  "0.6": [55.34, 123.75, 175.01, 214.34, 247.5, 276.72, 303.13, 327.42, 350.02, 371.26, 391.34, 410.44, 428.69, 446.19, 463.04, 479.29, 495.01, 510.24, 525.03, 539.42, 553.44, 567.1, 580.45],
  "0.7": [76.99, 172.16, 243.47, 298.18, 344.31, 384.95, 421.7, 455.48, 486.93, 516.47, 544.41, 570.98, 596.37, 620.72, 644.15, 666.76, 688.63, 709.82, 730.4, 750.41, 769.91, 788.92, 807.49],
  "0.8": [100.81, 225.42, 318.8, 390.45, 450.85, 504.06, 552.18, 596.42, 637.6, 676.27, 712.86, 747.65, 780.89, 812.78, 843.46, 873.07, 901.7, 929.45, 956.4, 982.6, 1008.13, 1033.03, 1057.33],
  "0.9": [125.62, 280.89, 397.24, 486.52, 561.79, 628.1, 688.04, 743.17, 794.49, 842.68, 888.26, 931.62, 973.04, 1012.77, 1051, 1087.89, 1123.57, 1158.15, 1191.73, 1224.38, 1256.19, 1287.21, 1317.5],
  "1.0": [149.56, 334.43, 472.96, 579.25, 668.86, 747.81, 819.19, 884.82, 945.91, 1003.29, 1057.56, 1109.18, 1158.5, 1205.81, 1251.33, 1295.25, 1337.72, 1378.9, 1418.87, 1457.75, 1495.62, 1532.56, 1568.62]
};

const pressures = [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11];

const interpolate = (arr, index) => {
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return arr[lower];
  if (lower < 0) return arr[0];
  if (upper >= arr.length) return arr[arr.length - 1];
  return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
};

// 색상 팔레트
const colors = {
  primary: "#4F46E5", // 인디고
  secondary: "#06B6D4", // 시안
  accent: "#8B5CF6", // 보라
  success: "#10B981", // 에메랄드
  warning: "#F59E0B", // 앰버
  danger: "#EF4444", // 빨강
  gradient: {
    from: "rgba(79, 70, 229, 0.8)",
    to: "rgba(6, 182, 212, 0.2)"
  }
};

// 물방울 애니메이션 컴포넌트
const WaterDrop = ({ size, flowRate }) => {
  // 유량에 따라 애니메이션 속도 조절
  const duration = 2 / (flowRate / 1000 + 0.1);
  
  return (
    <div className="relative w-full h-32 flex justify-center items-center overflow-hidden">
      <div className="absolute w-full h-full bg-gradient-to-b from-cyan-100 to-cyan-50 opacity-30"></div>
      
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-b from-blue-400 to-cyan-300"
          style={{
            width: `${size * (1 + i * 0.2)}px`,
            height: `${size * (1 + i * 0.2)}px`,
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
            zIndex: 10 - i,
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ 
            y: ["-100%", "100%"],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: duration * (1 + i * 0.3),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />
      ))}
    </div>
  );
};

// 게이지 컴포넌트
const Gauge = ({ value, max, color, label }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-xs font-medium text-gray-500">{value.toFixed(2)}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, type: "spring" }}
        />
      </div>
    </div>
  );
};

const App = () => {
  const [pressure, setPressure] = useState(5);
  const [orificeSize, setOrificeSize] = useState("0.6");
  const [showChart, setShowChart] = useState(false);
  const [activeTab, setActiveTab] = useState("gauge");
  const [flowUnit, setFlowUnit] = useState("sec"); // "min" 또는 "sec"
  
  // 사용자 세팅 진단을 위한 상태
  const [userPressure, setUserPressure] = useState("");
  const [userOrificeSize, setUserOrificeSize] = useState("");
  const [userFlowRate, setUserFlowRate] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  
  // 정확한 인덱스 계산을 위한 함수
  const getPressureIndex = (pressureValue) => {
    // pressures 배열에서 정확히 일치하는 값 찾기
    const exactIndex = pressures.findIndex(p => p === pressureValue);
    if (exactIndex !== -1) {
      return exactIndex;
    }
    
    // 정확히 일치하지 않을 경우 적절한 인덱스 계산
    // 0.1 간격의 슬라이더 값에 대해 정확한 보간 인덱스 계산
    const lowerPressure = Math.max(...pressures.filter(p => p <= pressureValue));
    const upperPressure = Math.min(...pressures.filter(p => p >= pressureValue));
    
    if (lowerPressure === upperPressure) {
      return pressures.indexOf(lowerPressure);
    }
    
    const lowerIndex = pressures.indexOf(lowerPressure);
    const upperIndex = pressures.indexOf(upperPressure);
    
    // 두 압력값 사이의 비율을 계산하여 인덱스 보간
    const ratio = (pressureValue - lowerPressure) / (upperPressure - lowerPressure);
    return lowerIndex + ratio * (upperIndex - lowerIndex);
  };

  const pressureIndex = getPressureIndex(pressure);
  const selectedFlow = flowData[orificeSize] ? interpolate(flowData[orificeSize], pressureIndex) : 0;
  
  // 차트 데이터 계산
  const chartData = useMemo(() => {
    const data = [];
    // 0.1 간격으로 차트 데이터 생성
    for (let p = 0.1; p <= 11; p += 0.1) {
      const idx = getPressureIndex(p);
      const flowValue = flowData[orificeSize] ? interpolate(flowData[orificeSize], idx) : 0;
      data.push({
        pressure: p,
        flow: flowUnit === "min" ? flowValue : flowValue / 60
      });
    }
    return data;
  }, [orificeSize, flowUnit]);

  // 0.5 간격의 압력 값만 표시하기 위한 X축 눈금 생성
  const xAxisTicks = useMemo(() => {
    const ticks = [];
    for (let p = 0.5; p <= 11; p += 0.5) {
      ticks.push(p);
    }
    return ticks;
  }, []);

  // 차트 설정
  const chartConfig = {
    type: 'line',
    data: {
      datasets: [
        {
          label: flowUnit === "min" ? '분당 유량 (g/min)' : '초당 유량 (g/s)',
          data: chartData.map(d => ({x: d.pressure, y: d.flow})),
          fill: true,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: colors.primary,
          tension: 0.4,
          pointBackgroundColor: colors.primary,
          pointRadius: (ctx) => {
            // 현재 압력과 가장 가까운 데이터 포인트 찾기
            const dataPoint = Math.round(pressure * 10) / 10;
            const pointIndex = chartData.findIndex(d => Math.abs(d.pressure - dataPoint) < 0.05);
            return ctx.dataIndex === pointIndex ? 6 : 0;
          },
          pointHoverRadius: 8,
        }
      ]
    },
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 11,
        title: {
          display: true,
          text: '압력 (BAR)'
        },
        grid: {
          display: false
        },
        ticks: {
          stepSize: 0.5,
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      y: {
        title: {
          display: true,
          text: flowUnit === "min" ? '유량 (g/min)' : '유량 (g/s)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (items) => `압력: ${items[0].label} BAR`,
          label: (item) => `유량: ${item.formattedValue} g/min`
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 후 차트 표시
    const timer = setTimeout(() => {
      setShowChart(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 유량의 최대값 계산 (그래프 스케일링용)
  const maxFlow = Math.max(...Object.values(flowData).map(arr => Math.max(...arr)));

  // 모든 구경에 대한 차트 데이터 생성
  const allOrificeChartData = useMemo(() => {
    const datasets = [];
    const colors = [
      { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)' },  // 인디고
      { borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)' },  // 시안
      { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }, // 보라
      { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }, // 에메랄드
      { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' }, // 앰버
      { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },  // 빨강
      { borderColor: '#6366F1', backgroundColor: 'rgba(99, 102, 241, 0.1)' }  // 인디고 계열
    ];
    
    Object.keys(flowData).forEach((size, index) => {
      const data = [];
      // 0.5 간격으로 데이터 포인트 생성
      for (let p = 0.1; p <= 11; p += 0.5) {
        const idx = (p - 0.1) / 0.5;
        if (idx >= 0 && idx < flowData[size].length) {
          const flowValue = flowData[size][Math.floor(idx)] + 
                 (idx % 1) * (flowData[size][Math.ceil(idx)] - flowData[size][Math.floor(idx)]);
          data.push({
            x: p,
            y: flowUnit === "min" ? flowValue : flowValue / 60
          });
        }
      }
      
      datasets.push({
        label: `${size} mm`,
        data: data,
        borderColor: colors[index % colors.length].borderColor,
        backgroundColor: 'transparent',
        borderWidth: size === orificeSize ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.4
      });
    });
    
    return datasets;
  }, [orificeSize, flowUnit]);
  
  // 전체 유량 차트 옵션
  const allChartsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 11,
        title: {
          display: true,
          text: '압력 (BAR)'
        },
        grid: {
          display: false
        },
        ticks: {
          stepSize: 0.5,
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      y: {
        title: {
          display: true,
          text: flowUnit === "min" ? '유량 (g/min)' : '유량 (g/s)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (items) => `압력: ${items[0].parsed.x} BAR`,
          label: (item) => `${item.dataset.label}: ${item.parsed.y.toFixed(1)} g/min`
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 1000
    }
  };

  // 세팅 진단 함수
  const diagnoseSetting = () => {
    // 입력값 검증
    if (!userPressure || !userOrificeSize || !userFlowRate) {
      setDiagnosisResult({
        status: "error",
        message: "모든 값을 입력해주세요."
      });
      return;
    }
    
    const pressure = parseFloat(userPressure);
    const orificeSize = userOrificeSize;
    const flowRate = parseFloat(userFlowRate);
    
    // 압력과 구경에 따른 예상 유량 계산
    const pressureIndex = getPressureIndex(pressure);
    const expectedFlow = flowData[orificeSize] ? interpolate(flowData[orificeSize], pressureIndex) : 0;
    
    // 편차 계산 (%)
    const deviation = Math.abs((flowRate - expectedFlow) / expectedFlow * 100);
    
    // 역산: 유량과 구경으로 예상 압력 계산
    const expectedPressure = calculatePressureFromFlow(flowRate, orificeSize);
    
    // 진단 결과 생성
    let result = {
      status: deviation <= 10 ? "normal" : "warning",
      deviation: deviation.toFixed(1),
      expectedFlow: expectedFlow.toFixed(1),
      actualFlow: flowRate.toFixed(1),
      expectedPressure: expectedPressure.toFixed(1),
      actualPressure: pressure.toFixed(1)
    };
    
    // 문제 진단
    if (deviation > 10) {
      if (flowRate < expectedFlow) {
        result.issues = [
          "압력 손실 가능성이 있습니다.",
          "지글러에 스케일이 쌓였을 수 있습니다.",
          "압력 게이지가 정확하지 않을 수 있습니다."
        ];
        result.suggestions = [
          "머신의 압력 게이지를 점검해보세요.",
          "지글러를 세척하거나 교체해보세요.",
          "워터 펌프의 상태를 확인해보세요."
        ];
      } else {
        result.issues = [
          "지글러 구경이 실제보다 크거나 제조 상태가 정상이 아닐 수 있습니다.",
          "압력 게이지가 정확하지 않을 수 있습니다."
        ];
        result.suggestions = [
          "지글러 사이즈를 정확히 측정해보세요.",
          "압력 게이지를 보정하거나 교체해보세요."
        ];
      }
    } else {
      result.message = "설정이 정상입니다. 편차가 10% 이내입니다.";
    }
    
    setDiagnosisResult(result);
  };
  
  // 유량과 지글러 구경을 기반으로 압력 역산 함수
  const calculatePressureFromFlow = (flow, orificeSize) => {
    // 지글러 구경에 해당하는 유량 데이터가 없는 경우
    if (!flowData[orificeSize]) return 0;
    
    const flowValues = flowData[orificeSize];
    
    // 유량이 최소값보다 작거나 최대값보다 큰 경우 처리
    if (flow <= flowValues[0]) return pressures[0];
    if (flow >= flowValues[flowValues.length - 1]) return pressures[pressures.length - 1];
    
    // 이분 탐색으로 가장 가까운 유량값 찾기
    let left = 0;
    let right = flowValues.length - 1;
    
    // 정확히 일치하는 유량값 찾기
    for (let i = 0; i < flowValues.length; i++) {
      if (Math.abs(flowValues[i] - flow) < 0.001) {
        return pressures[i];
      }
    }
    
    // 가장 가까운 두 유량값 사이에서 보간
    while (left <= right) {
      if (flow < flowValues[left]) return pressures[left];
      if (flow > flowValues[right]) return pressures[right];
      
      if (flow >= flowValues[left] && flow <= flowValues[left + 1]) {
        // 두 지점 사이에서 선형 보간
        const ratio = (flow - flowValues[left]) / (flowValues[left + 1] - flowValues[left]);
        return pressures[left] + ratio * (pressures[left + 1] - pressures[left]);
      }
      
      left++;
    }
    
    // 기본값 (정확한 값을 찾지 못한 경우)
    return 0;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-6xl border border-indigo-100"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl mt-6 font-bold text-center bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-2">
            에스프레소 머신 Water Debit 계산기
          </h1>
          <p className="text-center text-gray-500 mb-12">지글러 구경과 압력에 따른 유량 분석 도구</p>
        </motion.div>

        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* 컨트롤 패널 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-1/3 bg-gradient-to-br from-indigo-50 to-cyan-50 p-5 rounded-xl shadow-inner"
          >
            {/* 지글러 구경 선택 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">지글러 구경 (mm)</label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-white appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all pr-10"
                  value={orificeSize}
                  onChange={(e) => setOrificeSize(e.target.value)}
                >
                  {Object.keys(flowData).map((size) => (
                    <option key={size} value={size}>
                      {size} mm
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 압력 슬라이더 */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                압력 (BAR):
                <span className="ml-2 inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                  {pressure.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min="0.1"
                max="11"
                step="0.1"
                value={pressure}
                onChange={(e) => setPressure(parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-indigo-200 to-cyan-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span>11</span>
              </div>
            </div>
            
            {/* 현재 유량 결과 카드 */}
            <motion.div
              className="bg-white p-4 rounded-lg shadow-md border border-indigo-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h2 className="text-md font-semibold text-indigo-700 mb-3">현재 유량</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">초당 유량:</span>
                  <motion.span 
                    key={selectedFlow} 
                    initial={{ scale: 1.2, color: "#4F46E5" }}
                    animate={{ scale: 1, color: "#374151" }}
                    className="font-bold"
                  >
                    {(selectedFlow / 60).toFixed(2)} g/s
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">분당 유량:</span>
                  <motion.span 
                    key={selectedFlow + "_min"}
                    initial={{ scale: 1.2, color: "#4F46E5" }}
                    animate={{ scale: 1, color: "#374151" }}
                    className="font-bold"
                  >
                    {selectedFlow.toFixed(2)} g/min
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">시간당 유량:</span>
                  <span className="font-bold">{((selectedFlow * 60) / 1000).toFixed(2)} L/h</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 시각화 패널 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-2/3 max-w-[700px]"
          >
            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "gauge"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("gauge")}
              >
                게이지 보기
              </button>
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "chart"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("chart")}
              >
                차트 보기
              </button>
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "allCharts"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("allCharts")}
              >
                전체 유량 차트
              </button>
              <button
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "diagnosis"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("diagnosis")}
              >
                세팅 진단
              </button>
            </div>

            {/* 선택된 탭에 따른 컨텐츠 */}
            <AnimatePresence mode="wait">
              {activeTab === "gauge" && (
                <motion.div
                  key="gauge"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">유량 게이지</h2>
                  
                  <div className="flex flex-col md:flex-row md:gap-6">
                    {/* 왼쪽: 게이지 표시 */}
                    <div className="space-y-6 md:w-2/3">
                      <Gauge 
                        value={selectedFlow} 
                        max={maxFlow} 
                        color="bg-gradient-to-r from-indigo-500 to-cyan-400"
                        label="분당 유량 (g/min)" 
                      />
                      
                      <Gauge 
                        value={selectedFlow / 60} 
                        max={maxFlow / 60} 
                        color="bg-gradient-to-r from-indigo-400 to-purple-400"
                        label="초당 유량 (g/s)" 
                      />
                      
                      <Gauge 
                        value={pressure} 
                        max={11} 
                        color="bg-gradient-to-r from-cyan-400 to-emerald-400"
                        label="압력 (BAR)" 
                      />
                    </div>
                    
                    {/* 오른쪽: 비교 지표 */}
                    <div className="mt-6 md:mt-0 md:w-1/3 p-4 bg-gray-50 rounded-lg h-fit">
                      <h3 className="text-md font-medium text-gray-700 mb-2">다른 구경과 비교</h3>
                      <div className="space-y-3">
                        {Object.keys(flowData).map(size => {
                          if (size === orificeSize) return null;
                          const compareIndex = (pressure - 0.1) / 0.5;
                          const compareFlow = interpolate(flowData[size], compareIndex);
                          const ratio = (selectedFlow / compareFlow).toFixed(2);
                          return (
                            <div key={size} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{size} mm:</span>
                              <span className={`${
                                ratio > 1 ? "text-emerald-600" : "text-red-500"
                              }`}>
                                {ratio > 1 ? `+${((ratio - 1) * 100).toFixed(0)}%` : `${((1 - ratio) * 100).toFixed(0)}%`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "chart" && (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">유량 차트</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">유량 단위:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            flowUnit === "min" 
                              ? "bg-indigo-500 text-white" 
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setFlowUnit("min")}
                        >
                          g/min
                        </button>
                        <button
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            flowUnit === "sec" 
                              ? "bg-indigo-500 text-white" 
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setFlowUnit("sec")}
                        >
                          g/s
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-96">
                    {showChart && (
                      <Line 
                        options={chartOptions}
                        data={{
                          datasets: [
                            {
                              label: flowUnit === "min" ? '분당 유량 (g/min)' : '초당 유량 (g/s)',
                              data: chartData.map(d => ({x: d.pressure, y: d.flow})),
                              fill: true,
                              backgroundColor: 'rgba(79, 70, 229, 0.2)',
                              borderColor: colors.primary,
                              tension: 0.4,
                              pointBackgroundColor: colors.primary,
                              pointRadius: (ctx) => {
                                // 현재 압력과 가장 가까운 데이터 포인트 찾기
                                const dataPoint = Math.round(pressure * 10) / 10;
                                const pointIndex = chartData.findIndex(d => Math.abs(d.pressure - dataPoint) < 0.05);
                                return ctx.dataIndex === pointIndex ? 6 : 0;
                              },
                              pointHoverRadius: 8,
                            }
                          ]
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <h3 className="text-sm font-semibold text-indigo-700">기본 압력 구간 평균 유량 (8-10 BAR)</h3>
                      <p className="text-2xl font-bold text-indigo-900">
                        {(chartData.filter(d => d.pressure >= 8 && d.pressure <= 10)
                          .reduce((sum, d) => sum + d.flow, 0) / 
                          chartData.filter(d => d.pressure >= 8 && d.pressure <= 10).length)
                        .toFixed(2)} <span className="text-sm">g/min</span>
                      </p>
                      <p className="text-xs text-indigo-700">일반적인 에스프레소 추출 압력 구간</p>
                    </div>
                    
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <h3 className="text-sm font-semibold text-cyan-700">Pre-infusion 구간 평균 유량 (2-4 BAR)</h3>
                      <p className="text-2xl font-bold text-cyan-900">
                        {(chartData.filter(d => d.pressure >= 2 && d.pressure <= 4)
                          .reduce((sum, d) => sum + d.flow, 0) / 
                          chartData.filter(d => d.pressure >= 2 && d.pressure <= 4).length)
                        .toFixed(2)} <span className="text-sm">g/min</span>
                      </p>
                      <p className="text-xs text-cyan-700">프리인퓨전 설정 압력 참고(시네소 mvp 등)</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "allCharts" && (
                <motion.div
                  key="allCharts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">전체 유량 차트</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">유량 단위:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            flowUnit === "min" 
                              ? "bg-indigo-500 text-white" 
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setFlowUnit("min")}
                        >
                          g/min
                        </button>
                        <button
                          className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            flowUnit === "sec" 
                              ? "bg-indigo-500 text-white" 
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setFlowUnit("sec")}
                        >
                          g/s
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[400px]">
                    {showChart && (
                      <Line 
                        options={allChartsOptions}
                        data={{
                          datasets: allOrificeChartData
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">구경별 유량 비교 (현재 압력: {pressure.toFixed(1)} BAR)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="overflow-hidden overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구경 (mm)</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유량 (g/min)</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비율</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.keys(flowData).map(size => {
                              const idx = (pressure - 0.1) / 0.5;
                              const flow = interpolate(flowData[size], idx);
                              const ratio = size === "0.6" ? 1 : flow / interpolate(flowData["0.6"], idx);
                              
                              return (
                                <tr key={size} className={size === orificeSize ? "bg-indigo-50" : ""}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{size} mm</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{flow.toFixed(1)} g/min</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span className={`${
                                      ratio > 1 ? "text-emerald-600" : ratio < 1 ? "text-red-500" : "text-gray-500"
                                    }`}>
                                      {ratio.toFixed(2)}x
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-indigo-700 mb-3">구경별 특성</h4>
                        <div className="space-y-2 text-sm">
                          <div className="font-xs">
                            <span className="font-xs text-gray-700">작은 구경 (0.4-0.5mm):</span>
                            <p className="text-gray-600">👉🏻 저유량, 저속 프리인퓨전, 지글러 스케일 유의</p>
                          </div>
                          <div className="font-xs">
                            <span className="font-xs text-gray-700">중간 구경 (0.6-0.7mm):</span>
                            <p className="text-gray-600">👉🏻 표준 유량 및 프리인퓨전</p>
                          </div>
                          <div className="font-xs">
                            <span className="font-xs text-gray-700">큰 구경 (0.8-1.0mm):</span>
                            <p className="text-gray-600">👉🏻 고유량, 워터해머, 채널링 유의</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-blue-100">
                          <p className="text-xs text-gray-500">
                            * 0.1mm 직경 증가시 유량은 약 30-40% 증가
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            * 현재 선택된 구경: <span className="font-medium text-indigo-600">{orificeSize} mm</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "diagnosis" && (
                <motion.div
                  key="diagnosis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">세팅 진단</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        실제 측정한 압력, 지글러 구경, 유량을 입력하여 머신 세팅이 정상인지 확인해보세요.
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        👉🏻 본 앱은 섭씨 95도 추출수 체적유량(g)으로 계산되었습니다. 오차가 크다면, 머신 보일러 온도를 95도로 조절해주세요.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">실제 게이지 표시 압력 (BAR)</label>
                        <input
                          type="number"
                          min="0.1"
                          max="11"
                          step="0.1"
                          value={userPressure}
                          onChange={(e) => setUserPressure(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="예: 9.0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">지글러 구경 (mm)</label>
                        <select
                          value={userOrificeSize}
                          onChange={(e) => setUserOrificeSize(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">구경 선택</option>
                          {Object.keys(flowData).map((size) => (
                            <option key={size} value={size}>
                              {size} mm
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">측정된 유량 (g/min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={userFlowRate}
                        onChange={(e) => setUserFlowRate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="예: 250.0"
                      />
                    </div>
                    
                    <button
                      onClick={diagnoseSetting}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      설정 진단하기
                    </button>
                  </div>
                  
                  {diagnosisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-8 p-4 rounded-lg ${
                        diagnosisResult.status === "normal" 
                          ? "bg-emerald-50 border border-emerald-200" 
                          : diagnosisResult.status === "warning"
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {diagnosisResult.status === "error" ? (
                        <p className="text-red-600 text-sm font-medium">{diagnosisResult.message}</p>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">예상 유량</p>
                              <p className="text-lg font-bold text-indigo-700">{diagnosisResult.expectedFlow} <span className="text-xs">g/min</span></p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">실제 유량</p>
                              <p className="text-lg font-bold text-indigo-700">{diagnosisResult.actualFlow} <span className="text-xs">g/min</span></p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">예상 압력</p>
                              <p className="text-lg font-bold text-indigo-700">{diagnosisResult.expectedPressure} <span className="text-xs">BAR</span></p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">편차</p>
                              <p className={`text-lg font-bold ${
                                parseFloat(diagnosisResult.deviation) <= 10 
                                  ? "text-emerald-600" 
                                  : "text-amber-600"
                              }`}>{diagnosisResult.deviation}%</p>
                            </div>
                          </div>
                          
                          {diagnosisResult.message && (
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <p className={`text-sm font-medium ${
                                diagnosisResult.status === "normal" 
                                  ? "text-emerald-600" 
                                  : "text-amber-600"
                              }`}>{diagnosisResult.message}</p>
                            </div>
                          )}
                          
                          {diagnosisResult.issues && (
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">가능한 원인:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {diagnosisResult.issues.map((issue, index) => (
                                  <li key={index} className="text-sm text-gray-600">{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {diagnosisResult.suggestions && (
                            <div className="bg-white p-3 rounded-lg shadow-sm">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">제안:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {diagnosisResult.suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        <div className="mt-10 mb-4 flex flex-col items-center text-center text-gray-500 text-sm">
          <div className="mb-1">
            Copyright 2025. Sprogeeks All rights reserved.
          </div>
          <div>
            <a 
              href="https://patreon.com/sprogeeks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              🚀 https://patreon.com/sprogeeks
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default App;


