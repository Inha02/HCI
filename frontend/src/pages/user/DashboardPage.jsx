import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FIXED_USER_ID = '6a1a843ca1b8851b791f7485';

const Dashboard = () => {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/dashboard/summary?userId=${FIXED_USER_ID}&period=${period}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const result = await res.json();
          console.log(`=== 🟢 백엔드 수신 데이터 (${period.toUpperCase()} 탭) ===`, result);
          setData(result);
        } else {
          console.error('대시보드 데이터 로드 실패:', res.status);
        }
      } catch (error) {
        console.error('대시보드 통신 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  const eyeStats = data?.eye || { avgBlinkPerMinute: 0, totalDrowsyCount: 0, measuredMinutes: 0 };
  const recentLogs = data?.exercise?.recentLogs || [];

  // 안구 운동 타입별 카운트
  const blinkCount = recentLogs.filter(log => log.type === 'BLINK' && log.success).length;
  const trackingCount = recentLogs.filter(log => log.type === 'TRACKING' && log.success).length;
  const focusCount = recentLogs.filter(log => log.type === 'FOCUS' && log.success).length;

  // 평균 운동수행률 계산
  const getCalculatedExerciseRate = () => {
    if (recentLogs.length === 0) return 0;
    const dailyLogsMap = {};

    recentLogs.forEach(log => {
      if (!log.success || !log.createdAt) return;
      const dateKey = log.createdAt.split('T')[0];
      if (!dailyLogsMap[dateKey]) {
        dailyLogsMap[dateKey] = new Set();
      }
      dailyLogsMap[dateKey].add(log.type);
    });

    const activeDays = Object.keys(dailyLogsMap).length;
    if (activeDays === 0) return 0;

    let totalPeriodScore = 0;
    Object.values(dailyLogsMap).forEach(typesSet => {
      const count = typesSet.size;
      if (count >= 3) totalPeriodScore += 100;
      else if (count === 2) totalPeriodScore += 66.66;
      else if (count === 1) totalPeriodScore += 33.33;
    });

    return Math.round(totalPeriodScore / activeDays);
  };

  const exerciseRate = getCalculatedExerciseRate();



  const generateMonthlyHeatmapData = () => {
    if (!data?.range?.startDate) return [];

    const startDate = new Date(data.range.startDate);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;

    const totalDays = new Date(year, month, 0).getDate();
    
    const heatmapDays = [];

    for (let d = 1; d <= totalDays; d++) {
      
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const completedTypes = new Set();
      recentLogs.forEach(log => {
        if (log.success && log.createdAt && log.createdAt.startsWith(dateStr)) {
          completedTypes.add(log.type);
        }
      });

      heatmapDays.push({
        dayNum: d,
        dateString: dateStr,
        count: completedTypes.size
      });
    }
    return heatmapDays;
  };

  const heatmapData = generateMonthlyHeatmapData();

  const getHeatmapColorByCount = (count) => {
    switch (count) {
      case 3: return '#4D59E6';
      case 2: return '#7B86FF';
      case 1: return '#9FA7FF';
      default: return '#1F243A'; 
    }
  };

  const formatDateRange = () => {
    if (!data?.range?.startDate) return '';
    
    const start = new Date(data.range.startDate);
    const format = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    
    if (period === 'day') {
      return `(${format(start)})`;
    }
    
    const end = new Date(data.range.endDate);
    return `(${format(start)} ~ ${format(end)})`;
  };

  const bpmChartData = data?.bpmChart || [];
  const drowsyChartData = data?.drowsyChart || [];


  const maxBpmValue = Math.max(...bpmChartData.map(d => d.value), 0) || 10;
  const maxDrowsyValue = Math.max(...drowsyChartData.map(d => d.value), 0) || 10;

  const getChartTitles = () => {
    if (period === 'day') {
      return { bpm: '평균 BPM - 오늘 시간대별', drowsy: '졸음 감지 횟수 - 오늘 시간대별', exercise: '오늘 안구 운동 수행 기록' };
    }
    if (period === 'week') {
      return { bpm: '평균 BPM - 최근 7일', drowsy: '졸음 감지 횟수 - 최근 7일', exercise: '이번 주 안구 운동 수행 기록' };
    }
    return { bpm: '평균 BPM - 이번 달 주차별', drowsy: '졸음 감지 횟수 - 이번 달 주차별', exercise: '이번 달 안구 운동 수행 기록 (30일 수행력)' };
  };

  return (
    <Container>
      <Wrapper>
        <Header>
          <TitleSection>
            <Title><TitleIcon>📊</TitleIcon> 나의 눈 건강 통계</Title>
            <SubTitle>
              나의 눈 깜빡임·졸음·운동 데이터를 한눈에 확인하세요! <DateRangeText>{formatDateRange()}</DateRangeText>
            </SubTitle>
          </TitleSection>
          
          <TabGroup>
            <TabButton active={period === 'day'} onClick={() => setPeriod('day')}>일</TabButton>
            <TabButton active={period === 'week'} onClick={() => setPeriod('week')}>주</TabButton>
            <TabButton active={period === 'month'} onClick={() => setPeriod('month')}>월</TabButton>
          </TabGroup>
        </Header>

        {loading ? (
          <LoadingMessage>데이터 동기화 중...</LoadingMessage>
        ) : (
          <>
            {/* 4열 스코어보드 정보 카드 */}
            <SummaryGrid>
              <Card>
                <CardLabel>평균 BPM</CardLabel>
                <CardValue color="#7B86FF">{Math.round(eyeStats.avgBlinkPerMinute * 10) / 10}회/분</CardValue>
                {eyeStats.avgBlinkPerMinute > 0 && eyeStats.avgBlinkPerMinute < 15 ? (
                  <Badge $bg="#FF7B7B" color="#FFF">기준 미달</Badge>
                ) : (
                  <Badge $bg="#7B86FF" color="#FFF">정상 범위</Badge>
                )}
              </Card>

              <Card>
                <CardLabel>졸음 감지 횟수</CardLabel>
                <CardValue color="#7B86FF">총 {eyeStats.totalDrowsyCount ?? 0}회</CardValue>
                {(eyeStats.totalDrowsyCount ?? 0) >= 5 ? (
                  <Badge $bg="#FFB87B" color="#5C3A1A">주의 필요</Badge>
                ) : (
                  <Badge $bg="#7B86FF" color="#FFF">안전</Badge>
                )}
              </Card>

              <Card>
                <CardLabel>평균 운동 수행률</CardLabel>
                <CardValue color="#7B86FF">{exerciseRate}%</CardValue>
                {exerciseRate >= 70 ? (
                  <Badge $bg="#4D59E6" color="#FFF">좋음</Badge>
                ) : (
                  <Badge $bg="#FF7B7B" color="#FFF">노력 필요</Badge>
                )}
              </Card>

              <Card>
                <CardLabel>모니터링 측정 시간</CardLabel>
                <CardValue color="#00E5FF">{eyeStats.measuredMinutes ?? 0}분</CardValue>
                <Badge $bg="rgba(0, 229, 255, 0.15)" color="#00E5FF">실시간 누적</Badge>
              </Card>
            </SummaryGrid>

            {/* 1. 평균 BPM 동적 그래프 (배경 어둡게 시인성 개선) */}
            <ChartSection>
              <ChartTitle>{getChartTitles().bpm}</ChartTitle>
              <BarChartContainer>
                {bpmChartData.length === 0 ? (
                  <NoDataText>해당 기간의 깜빡임 데이터가 없습니다.</NoDataText>
                ) : (
                  bpmChartData.map((item, idx) => {
                    const calculatedHeight = maxBpmValue > 0 ? (item.value / maxBpmValue) * 100 : 0;
                    const isWarning = item.value > 0 && item.value < 15;
                    
                    return (
                      <BarWrapper key={idx}>
                        <ValueTooltip>{Math.round(item.value * 10) / 10}</ValueTooltip>
                        <BarContainer>
                          <Bar 
                            $height={item.value === 0 ? '6px' : `${calculatedHeight}%`} 
                            $bg={item.value === 0 ? '#343B54' : isWarning ? '#FF7B7B' : '#7B86FF'} 
                          />
                        </BarContainer>
                        {isWarning && <BadgeMini>미달</BadgeMini>}
                        <BarLabelText>{item.label}</BarLabelText>
                      </BarWrapper>
                    );
                  })
                )}
              </BarChartContainer>
            </ChartSection>

            {/* 2. 졸음 감지 횟수 동적 그래프 */}
            <ChartSection>
              <ChartTitle>{getChartTitles().drowsy}</ChartTitle>
              <BarChartContainer>
                {drowsyChartData.length === 0 ? (
                  <NoDataText>해당 기간의 졸음 감지 데이터가 없습니다.</NoDataText>
                ) : (
                  drowsyChartData.map((item, idx) => {
                    const calculatedHeight = maxDrowsyValue > 0 ? (item.value / maxDrowsyValue) * 100 : 0;
                    const isDrowsyAlert = item.value >= 1;
                    
                    return (
                      <BarWrapper key={idx}>
                        <ValueTooltip>{item.value}회</ValueTooltip>
                        <BarContainer>
                          <Bar 
                            $height={item.value === 0 ? '6px' : `${calculatedHeight}%`} 
                            $bg={item.value === 0 ? '#343B54' : isDrowsyAlert ? '#FF5252' : '#9FA7FF'} 
                          />
                        </BarContainer>
                        {isDrowsyAlert && <BadgeMini $bg="#FFB87B" color="#5C3A1A">주의</BadgeMini>}
                        <BarLabelText>{item.label}</BarLabelText>
                      </BarWrapper>
                    );
                  })
                )}
              </BarChartContainer>
            </ChartSection>

            {/* 3. 안구 운동 기록 섹션 및 월별 히트맵 */}
            <ChartSection>
              <ChartTitle>{getChartTitles().exercise}</ChartTitle>
              
              <ExerciseSummaryRow>
                <ExMiniCard>
                  <ExIcon>👁️</ExIcon>
                  <ExTitle>포인트 추적</ExTitle>
                  <ExCount>{trackingCount}회</ExCount>
                </ExMiniCard>
                <ExMiniCard>
                  <ExIcon>🎯</ExIcon>
                  <ExTitle>초점 전환</ExTitle>
                  <ExCount>{focusCount}회</ExCount>
                </ExMiniCard>
                <ExMiniCard>
                  <ExIcon>😑</ExIcon>
                  <ExTitle>눈 꼭 감기</ExTitle>
                  <ExCount>{blinkCount}회</ExCount>
                </ExMiniCard>
              </ExerciseSummaryRow>

              {period === 'month' && (
                <HeatmapContainer>
                  <HeatmapDivider />
                  <HeatmapHeaderRow>
                    <HeatmapSubTitle>📅 일별 운동 기록</HeatmapSubTitle>
                    <LegendGrid>
                      <span>미수행</span>
                      <LegendBox $color="#9FA7FF"/>
                      <LegendBox $color="#7B86FF"/>
                      <LegendBox $color="#4D59E6"/>
                      <span>3개 전체완료</span>
                    </LegendGrid>
                  </HeatmapHeaderRow>

                  <HeatmapGrid>
                    {heatmapData.map((item, index) => (
                      <HeatBlock 
                        key={index} 
                        $bgColor={getHeatmapColorByCount(item.count)} 
                        title={`${item.dateString} : ${item.count}개 완료`}
                      >
                        <DayNumberText>{item.dayNum}</DayNumberText>
                      </HeatBlock>
                    ))}
                  </HeatmapGrid>
                </HeatmapContainer>
              )}
            </ChartSection>
          </>
        )}
      </Wrapper>
    </Container>
  );
};

const Container = styled.div` width: 100%; min-height: 100vh; background-color: #050714; color: #FFF; padding: 50px 0; font-family: 'Pretendard', sans-serif; `;
const Wrapper = styled.div` width: 90%; max-width: 1200px; margin: 0 auto; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 20px; `;
const TitleSection = styled.div``;
const Title = styled.h1` font-size: 1.8rem; font-weight: 700; display: flex; align-items: center; margin: 0 0 8px 0; `;
const TitleIcon = styled.span` margin-right: 10px; font-size: 1.6rem; `;
const SubTitle = styled.p` color: #8E94A5; font-size: 0.95rem; margin: 0; display: flex; align-items: center; gap: 8px; `;
const DateRangeText = styled.span` color: #7B86FF; font-weight: 600; font-size: 0.9rem; `;
const TabGroup = styled.div` display: flex; background-color: #121631; padding: 6px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05); `;
const TabButton = styled.button` background-color: ${props => props.active ? '#7B86FF' : 'transparent'}; color: ${props => props.active ? '#FFF' : '#737A94'}; border: none; padding: 8px 24px; font-size: 1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; &:hover { color: #FFF; } `;

const SummaryGrid = styled.div` display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 35px; `;
const Card = styled.div` background: linear-gradient(135deg, #0C0F2F 0%, #080A21 100%); border: 1px solid rgba(123, 134, 255, 0.25); border-radius: 16px; padding: 25px 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3); `;
const CardLabel = styled.span` font-size: 0.95rem; color: #A3AABF; margin-bottom: 12px; font-weight: 500; `;
const CardValue = styled.h2` font-size: 2rem; font-weight: 800; color: ${props => props.color || '#FFF'}; margin: 0 0 12px 0; `;
const Badge = styled.span` background-color: ${props => props.$bg || '#7B86FF'}; color: ${props => props.color || '#FFF'}; padding: 5px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; `;


const ChartSection = styled.div` background-color: #121631; border-radius: 16px; padding: 35px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 8px 20px rgba(0,0,0,0.3); `;
const ChartTitle = styled.h3` font-size: 1.25rem; color: #FFF; font-weight: 700; margin: 0 0 35px 0; `;
const BarChartContainer = styled.div` display: flex; justify-content: space-around; align-items: flex-end; height: 220px; padding: 20px 10px 35px 10px; `;
const BarWrapper = styled.div` display: flex; flex-direction: column; align-items: center; flex: 1; max-width: 70px; position: relative; `;
const ValueTooltip = styled.span` font-size: 0.85rem; color: #8E94A5; font-weight: 700; margin-bottom: 8px; text-align: center; `;

const BarContainer = styled.div` width: 100%; height: 130px; display: flex; align-items: flex-end; justify-content: center; `;
const Bar = styled.div` width: 24px; height: ${props => props.$height || '6px'}; background-color: ${props => props.$bg || '#7B86FF'}; border-radius: 6px 6px 0 0; transition: height 0.4s ease-in-out; `;

const BarLabelText = styled.span` position: absolute; bottom: -30px; font-size: 0.9rem; color: #8E94A5; font-weight: 600; white-space: nowrap; `;
const BadgeMini = styled.span` position: absolute; bottom: -55px; background-color: ${props => props.$bg || '#FF7B7B'}; color: ${props => props.color || '#FFF'}; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 5px; white-space: nowrap; `;
const NoDataText = styled.div` color: #737A94; font-size: 1rem; font-weight: 500; padding-bottom: 40px; `;

const ExerciseSummaryRow = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; `;
const ExMiniCard = styled.div` border: 1.5px dashed rgba(123, 134, 255, 0.4); border-radius: 14px; padding: 20px; text-align: center; background-color: rgba(255, 255, 255, 0.02); `;
const ExIcon = styled.div` font-size: 1.5rem; margin-bottom: 8px; `;
const ExTitle = styled.div` font-size: 1.1rem; color: #8E94A5; font-weight: 700; margin-bottom: 6px; `;
const ExCount = styled.div` font-size: 1.4rem; color: #FFF; font-weight: 800; `;

const HeatmapContainer = styled.div` margin-top: 25px; display: flex; flex-direction: column; `;
const HeatmapDivider = styled.div` height: 1px; background-color: rgba(255, 255, 255, 0.08); margin: 25px 0; `;
const HeatmapHeaderRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const HeatmapSubTitle = styled.h4` font-size: 1.1rem; color: #FFF; margin: 0; font-weight: 700; `;
const LegendGrid = styled.div` display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #8E94A5; font-weight: 600; `;
const LegendBox = styled.div` width: 12px; height: 12px; background-color: ${props => props.$color}; border-radius: 3px; `;

const HeatmapGrid = styled.div` display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); `;
const HeatBlock = styled.div` aspect-ratio: 1.4 / 1; background-color: ${props => props.$bgColor}; border-radius: 8px; display: flex; justify-content: flex-end; align-items: flex-end; padding: 6px 8px; transition: all 0.2s ease-in-out; cursor: pointer; position: relative; box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.05); &:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.5); } `;
const DayNumberText = styled.span` font-size: 0.8rem; font-weight: 700; color: rgba(255, 255, 255, 0.25); `;
const LoadingMessage = styled.div` text-align: center; padding: 100px 0; font-size: 1.2rem; color: #7B86FF; font-weight: 600; `;

export default Dashboard;