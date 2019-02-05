import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries, CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
    MouseCoordinateY,
    EdgeIndicator,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { ema } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";
import {
	Annotate,
    SvgPathAnnotation,
    LabelAnnotation,
	buyPath,
	sellPath,
} from "react-stockcharts/lib/annotation";
import algo from "react-stockcharts/lib/algorithm";


class CandleStickChartWithCHMousePointer extends React.Component {

	render() {

        const buySell = algo()
			.windowSize(2)
			.accumulator(([prev, now]) => {
				const { ema20: prevShortTerm, ema50: prevLongTerm } = prev;
				const { ema20: nowShortTerm, ema50: nowLongTerm } = now;
				if (prevShortTerm < prevLongTerm && nowShortTerm > nowLongTerm) return "LONG";
				if (prevShortTerm > prevLongTerm && nowShortTerm < nowLongTerm) return "SHORT";
			})
            .merge((d, c) => { d.longShort = c; });

        const closeFillProps = {
            stroke: "#22a46e",
			fill: "#22a46e",
        };

        const openFillProps = {
            stroke: "#cc4060",
			fill: "#cc4060",
        };

		const longAnnotationPropsClose = {
            ...closeFillProps,
            y: ({ yScale, datum }) => yScale(datum.high + 40),
			path: buyPath,
            tooltip: "Close long",
        };

		const shortAnnotationPropsClose = {
			y: ({ yScale, datum }) => yScale(datum.high),
            ...closeFillProps,
			path: sellPath,
			tooltip: "Close short",
        };

        const longAnnotationPropsOpen = {
            y: ({ yScale, datum }) => yScale(datum.high + 40),
            ...openFillProps,
			path: buyPath,
            tooltip: "Open long",
        };

		const shortAnnotationPropsOpen = {
			y: ({ yScale, datum }) => yScale(datum.high),
            ...openFillProps,
			path: sellPath,
			tooltip: "Open short",
        };

        const ema20 = ema()
			.id(0)
			.options({ windowSize: 20 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => { d.ema50 = c; })
            .accessor(d => d.ema50);
            
        
        const { type, data: initialData, width, ratio } = this.props;
        const { gridProps } = this.props;
		const margin = { left: 70, right: 70, top: 20, bottom: 30 };

		const height = 400;
		const gridHeight = height - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const showGrid = true;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth,
                                   tickStrokeOpacity: 0.1,
                                   tickStrokeWidth: 1} : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight,
                                   tickStrokeOpacity: 0.1,
                                   tickStrokeWidth: 1} : {};
        
        const calculatedData = buySell(ema50(ema20(initialData)));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
        const xExtents = [start, end];

		return (
			<ChartCanvas
				height={400}
				ratio={ratio}
				width={width}
				margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				<Chart id={1} yExtents={[d => [d.high, d.low], ema20.accessor(), ema50.accessor()]}>
                    <XAxis axisAt="bottom" 
                           orient="bottom" 
                           {...gridProps} 
                           {...xGrid} 
                           opacity={0.0}
                           tickStroke="gray"
                           tickStrokeOpacity={0.2}
                    />
                    <YAxis axisAt="right" 
                           orient="right" 
                           ticks={5} 
                           {...gridProps} 
                           {...yGrid}
                           tickStroke="gray"
                           tickStrokeOpacity={0.2}
                    />
					<MouseCoordinateY
						at="right"
						orient="right"
                        displayFormat={format(".2f")}
                        stroke="#18aadc"
                        fill="#18aadc"  
					/>
                    <CandlestickSeries 
                        fill={d => d.close > d.open ? "#22a46e" : "#cc4060"}
                        stroke={d => d.close > d.open ? "#22a46e" : "#cc4060"}
                        wickStroke={d => d.close > d.open ? "#22a46e" : "#cc4060"}
                        opacity={1.0}
                        widthRatio={0.6}
                    />
                    <EdgeIndicator itemType="first" orient="right" edgeAt="right"
						yAccessor={ema20.accessor()} fill="#22a46e"
                        lineStroke="#22a46e"/>
                    <EdgeIndicator itemType="first" orient="right" edgeAt="right"
						yAccessor={ema50.accessor()} fill="#cc4060"
                        lineStroke="#cc4060"
                        tooltip="Just watch"/>
					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "LONG" && d.close > d.open}
						usingProps={longAnnotationPropsClose} />
					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "SHORT" && d.close > d.open}
						usingProps={shortAnnotationPropsClose} />
                    <Annotate with={SvgPathAnnotation} when={d => d.longShort === "LONG" && d.close <= d.open}
						usingProps={longAnnotationPropsOpen} />
					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "SHORT" && d.close <= d.open}
						usingProps={shortAnnotationPropsOpen} />
                    <Annotate with={LabelAnnotation} when={d => d.longShort === "SHORT" && d.close <= d.open}
						usingProps={shortAnnotationPropsOpen} />
				</Chart>
				<Chart
					id={2}
					height={150}
					yExtents={d => d.volume}
					origin={(w, h) => [0, h - 150]}
				>
					<MouseCoordinateX
						at="bottom"
						orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                        opacity={0.0}
                        width={2}
                        arrowWidth={7} 
					/>

					<BarSeries
						yAccessor={d => d.volume}
                        fill="gray"
                        stroke={false}
					/>
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}


CandleStickChartWithCHMousePointer.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithCHMousePointer.defaultProps = {
  type: "hybrid"
};
CandleStickChartWithCHMousePointer = fitWidth(
    CandleStickChartWithCHMousePointer
);

export default CandleStickChartWithCHMousePointer;
