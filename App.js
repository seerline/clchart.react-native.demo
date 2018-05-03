/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
  Dimensions,
  PixelRatio,
} from 'react-native';

import { throttle } from 'lodash'

const {width, height} = Dimensions.get('window');

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules
} from 'react-native';


import {
  GCanvasView,
} from 'react-native-gcanvas';


import { enable, ReactNativeBridge, Image as GImage } from "gcanvas.js";
import getMockData from './stockdata';
import * as ClChart from 'clchart';

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule;
ReactNativeBridge.Platform = Platform;

ReactNativeBridge.GCanvasModule.setLogLevel(0);



const deviceScale = PixelRatio.get();
const containerLayout = { width:width, height: (height - 140) }
const canvasLayout = { width: containerLayout.width * deviceScale, height: containerLayout.height * deviceScale }

const eventCentral = new ClChart.util.EV();

let count = 0


export default class App extends Component<{}> {

  mainCanvasRef = null;

  mainContext = null;

  mainCanvas = null;

  mainChart = null

  cursorCanvasRef = null;

  cursorContext = null;

  cursorCanvas = null;

  cursorChart = null

  menuTypes = {
    'MIN': 'handleMin',
    'DAY5': 'handleFiveDay',
    'DAY': 'handleKline',
    'WEEK': 'handleKline',
    'MON': 'handleKline',
    'M5': 'handleKline',
    'SEER': 'handleSeer'
  }

  state = {
    typeMenusCfg: [
      { type: 'MIN', fc: 'SH000001', label_en: '1 min(Idx)', label_zh: '分时(指数)' },
      { type: 'DAY5', fc: 'SH000001', label_en: '5 days(Idx)', label_zh: '五日(指数)' },
      { type: 'MIN', fc: 'SZ300545', label_en: '1 min', label_zh: '分时' },
      { type: 'DAY5', fc: 'SZ300545', label_en: '5 days', label_zh: '五日' },
      { type: 'DAY', fc: 'SZ300545', label_en: '1 day', label_zh: '日K' },
      { type: 'WEEK', fc: 'SZ300545', label_en: '1 week', label_zh: '周线' },
      { type: 'MON', fc: 'SZ300545', label_en: '1 month', label_zh: '月线' },
      { type: 'M5', fc: 'SZ300545', label_en: '5 min', label_zh: '5分钟' },
      { type: 'SEER', fc: 'SZ300545', label_en: 'seer(extend)', label_zh: '预测' }
    ]
  }

  initChart = () => {
    if (!this.mainCanvas || !this.cursorCanvas || !this.cursorContext) {
      return
    }
    const syscfg = {
      scale: deviceScale,
      runPlatform: 'react-native',
      eventPlatform: 'react-native',
      axisPlatform: 'phone',
      mainCanvas: {
        canvas: eventCentral,
        context: this.mainContext,
      },
      cursorCanvas: {
        canvas: eventCentral,
        context: this.cursorContext,
      },
    }
    this.mainChart = ClChart.createSingleChart(syscfg)
  }

  onMainCanvasLayout = () => {
    const canvas_tag = findNodeHandle(this.mainCanvasRef);
    const el = { ref:""+canvas_tag, style: canvasLayout};
    this.mainCanvas = enable(el, {bridge: ReactNativeBridge, disableAutoSwap: true});
    this.mainContext = this.mainCanvas.getContext('2d');
    this.mainContext._beforePaint = () => {
      this.mainContext.scale(1 / deviceScale, 1 / deviceScale);
    }
    this.mainContext._afterPaint = () => {
      this.mainCanvas._swapBuffers();
      count ++;
    }
    this.initChart();
  }

  onCursorCanvasLayout = () => {
    const canvas_tag = findNodeHandle(this.cursorCanvasRef);
    const el = { ref:""+canvas_tag, style: canvasLayout};
    this.cursorCanvas = enable(el, {bridge: ReactNativeBridge, disableAutoSwap: true});
    this.cursorContext = this.cursorCanvas.getContext('2d');
    this.cursorContext._beforePaint = () => {
      this.cursorContext.scale(1 / deviceScale, 1 / deviceScale);
    }
    this.cursorContext._afterPaint = () => {
      this.cursorCanvas._swapBuffers();
    }
    this.initChart();
  }
  
  handleMin = (code) => {
    console.log('Draw ====> Min Line')
    // 清除画布，及数据
    this.mainChart.clear()
    // 初始化数据
    this.mainChart.initData(20180413, ClChart.DEF_DATA.STOCK_TRADETIME)
    // 设置相应的数据
    this.mainChart.setData('INFO', ClChart.DEF_DATA.FIELD_INFO, getMockData(code, 'INFO'))
    this.mainChart.setData('MIN', ClChart.DEF_DATA.FIELD_MIN, getMockData(code, 'MIN'))
    this.mainChart.setData('TICK', ClChart.DEF_DATA.FIELD_TICK, getMockData(code, 'TICK'))
    this.mainChart.setData('NOW', ClChart.DEF_DATA.FIELD_NOW, getMockData(code, 'NOW'))
    // 设置画布尺寸
    let mainHeight = canvasLayout.height * 2 / 3
    let mainWidth = Math.max(canvasLayout.width * 0.65, canvasLayout.width - 400)
    if (code === 'SH000001') mainWidth = canvasLayout.width
    // 设置画布区域布局
    const mainLayoutCfg = {
      layout: ClChart.DEF_CHART.CHART_LAYOUT,
      config: ClChart.DEF_CHART.CHART_NOW,
      rectMain: {
        left: 0,
        top: 0,
        width: mainWidth,
        height: mainHeight
      }
    }
    const mainChart = this.mainChart.createChart('MIN', 'CHART.LINE', mainLayoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(mainChart, 'MIN')

    const volumeLoyoutCfg = {
      layout: ClChart.DEF_CHART.CHART_LAYOUT,
      config: ClChart.DEF_CHART.CHART_NOWVOL,
      rectMain: {
        left: 0,
        top: mainHeight,
        width: mainWidth,
        height: canvasLayout.height - mainHeight
      }
    }
    const volumeChart = this.mainChart.createChart('MINNOW', 'CHART.LINE', volumeLoyoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(volumeChart, 'MIN')

    if (code !== 'SH000001') {
      const orderLayoutCfg = {
        layout: ClChart.DEF_CHART.CHART_LAYOUT,
        config: ClChart.DEF_CHART.CHART_ORDER,
        rectMain: {
          left: mainWidth,
          top: 0,
          width: canvasLayout.width - mainWidth,
          height: canvasLayout.height
        }
      }
      const orderChart = this.mainChart.createChart('ORDER', 'CHART.ORDER', orderLayoutCfg, function (result) {
        //  console.log(result)
      })
      // ??? 为什么可以不绑定数据
      // this.mainChart.bindData(orderChart, 'TICK')
    }

    this.mainChart.onPaint()
  }

  handleFiveDay = (code) => {
    console.log('Five Day Line')
    this.mainChart.clear()
    this.mainChart.initData(20180413, ClChart.DEF_DATA.STOCK_TRADETIME)
    this.mainChart.setData('INFO', ClChart.DEF_DATA.FIELD_INFO, getMockData(code, 'INFO'))
    this.mainChart.setData('DAY5', ClChart.DEF_DATA.FIELD_DAY5, getMockData(code, 'DAY5'))
    this.mainChart.setData('MIN', ClChart.DEF_DATA.FIELD_MIN, getMockData(code, 'MIN'))
    const mainHeight = canvasLayout.height * 2 / 3
    const mainLayoutCfg = {
      layout: ClChart.DEF_CHART.CHART_LAYOUT,
      config: ClChart.DEF_CHART.CHART_DAY5,
      rectMain: {
        left: 0,
        top: 0,
        width: canvasLayout.width,
        height: mainHeight
      }
    }
    const KBarChart = this.mainChart.createChart('DAY5', 'CHART.LINE', mainLayoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KBarChart, 'DAY5')

    const volumeLoyoutCfg = {
      layout: ClChart.DEF_CHART.CHART_LAYOUT,
      config: ClChart.DEF_CHART.CHART_DAY5VOL,
      rectMain: {
        left: 0,
        top: mainHeight,
        width: canvasLayout.width,
        height: canvasLayout.height - mainHeight
      }
    }
    const KVBarChart = this.mainChart.createChart('VLINE5', 'CHART.LINE', volumeLoyoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KVBarChart, 'DAY5')

    this.mainChart.onPaint()
  }

  // 画日线
  handleKline = (code, peroid) => {
    let source = peroid
    if (peroid === 'WEEK' || peroid === 'MON') source = 'DAY'
    this.mainChart.clear()
    this.mainChart.initData(20180413, ClChart.DEF_DATA.STOCK_TRADETIME)
    this.mainChart.setData('INFO', ClChart.DEF_DATA.FIELD_INFO, getMockData(code, 'INFO'))
    this.mainChart.setData('RIGHT', ClChart.DEF_DATA.FIELD_RIGHT, getMockData(code, 'RIGHT'))
    this.mainChart.setData(source, ClChart.DEF_DATA.FIELD_DAY, getMockData(code, source))
    const mainHeight = canvasLayout.height * 2 / 3
    const mainLayoutCfg = {
      layout: {
        offset: {
          left: 5,
          right: 10
        }
      },
      buttons: ClChart.DEF_CHART.CHART_BUTTONS,
      config: ClChart.DEF_CHART.CHART_KBAR,
      rectMain: {
        left: 0,
        top: 0,
        width: canvasLayout.width,
        height: mainHeight
      }
    }
    const KBarChart = this.mainChart.createChart('KBAR', 'CHART.LINE', mainLayoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KBarChart, peroid)

    const volumeLoyoutCfg = {
      layout: {
        offset: {
          left: 5,
          right: 10
        }
      },
      config: ClChart.DEF_CHART.CHART_VBAR,
      rectMain: {
        left: 0,
        top: mainHeight,
        width: canvasLayout.width,
        height: canvasLayout.height - mainHeight
      }
    }
    const KVBarChart = this.mainChart.createChart('VBAR', 'CHART.LINE', volumeLoyoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KVBarChart, peroid)

    this.mainChart.onPaint()
  }

  handleSeer = () => {
    this.mainChart.clear()
    this.mainChart.initData(20180413, ClChart.DEF_DATA.STOCK_TRADETIME)
    this.mainChart.setData('INFO', ClChart.DEF_DATA.FIELD_INFO, getMockData('SZ300545', 'INFO'))
    this.mainChart.setData('RIGHT', ClChart.DEF_DATA.FIELD_RIGHT, getMockData('SZ300545', 'RIGHT'))
    this.mainChart.setData('DAY', ClChart.DEF_DATA.FIELD_DAY, getMockData('SZ300545', 'DAY'))
    this.mainChart.setData('SEER', ClChart.PLUGINS.FIELD_SEER, getMockData('SZ300545', 'SEER'))
    this.mainChart.setData('SEERHOT', {}, ['15'])
    const mainHeight = canvasLayout.height * 2 / 3
    const mainLayoutCfg = {
      layout: {
        offset: {
          left: 5,
          right: 100,
          top: 20,
          bottom: 20
        }
      },
      buttons: [ { key: 'zoomin' }, { key: 'zoomout' } ],
      config: ClChart.PLUGINS.CHART_SEER,
      rectMain: {
        left: 0,
        top: 0,
        width: canvasLayout.width,
        height: mainHeight
      }
    }
    const KBarChart = this.mainChart.createChart('SEER', 'CHART.LINE', mainLayoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KBarChart, 'DAY')

    const volumeLayoutCfg = {
      layout: {
        offset: {
          left: 5,
          right: 100,
          top: 20,
          bottom: 20
        }
      },
      config: ClChart.DEF_CHART.CHART_VBAR,
      rectMain: {
        left: 0,
        top: mainHeight,
        width: canvasLayout.width,
        height: canvasLayout.height - mainHeight
      }
    }
    const KVBarChart = this.mainChart.createChart('VBAR', 'CHART.LINE', volumeLayoutCfg, function (result) {
      //  console.log(result)
    })
    this.mainChart.bindData(KVBarChart, 'DAY')

    this.mainChart.onPaint()
  }

  drawChart (data) {
    data = data || {}
    const drawFunc = this.menuTypes[data.type]
    if (typeof this[drawFunc] === 'function') {
      this[drawFunc](data.fc, data.type)
    }
  }

  _renderButtons() {
    return (
      <View style={{height: 120, backgroundColor: '#ccc', alignContent: 'center', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap'}}>
        {this.state.typeMenusCfg.map(item => {
          return (
            <Button 
              key={item.fc + item.type}
              onPress={() => {
                this.drawChart(item)
              }}
              title={item.label_zh}
            />
          )
        })}
      </View>
    )
  }

  render() {
    return (
      <View>
        <View
          style={{flexDirection: 'row', marginTop: 20, flexWrap: 'wrap'}}
        >
          {this._renderButtons()}
        </View>
        <View
          style={[containerLayout, styles.canvasContainer]}
          onTouchStart={(evt) => {
            evt.nativeEvent.offsetX = evt.nativeEvent.locationX
            evt.nativeEvent.offsetY = evt.nativeEvent.locationY
            eventCentral.emit('touchstart', evt.nativeEvent)
          }}
          onTouchMove={(evt) => {
            evt.nativeEvent.offsetX = evt.nativeEvent.locationX
            evt.nativeEvent.offsetY = evt.nativeEvent.locationY
            eventCentral.emit('touchmove', evt.nativeEvent)         
          }}
          onTouchEnd={(evt) => {
            evt.nativeEvent.offsetX = evt.nativeEvent.locationX
            evt.nativeEvent.offsetY = evt.nativeEvent.locationY
            eventCentral.emit('touchend', evt.nativeEvent)
          }}
        >
          <GCanvasView
            onLayout={this.onMainCanvasLayout}
            ref={(c) => {
              this.mainCanvasRef = c
            }}
            style={[styles.gcanvas, containerLayout]}
          >
          </GCanvasView>
          <GCanvasView
            onLayout={this.onCursorCanvasLayout}
            ref={(c) => {
              this.cursorCanvasRef = c
            }}
            style={[styles.coverCanvas, containerLayout]}
          >
          </GCanvasView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  canvasContainer: {
    position: 'relative'
  },
  gcanvas: {
    backgroundColor: '#FF000030',
  },
  coverCanvas: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 10,
    top:20,
    height :40
  }
});
