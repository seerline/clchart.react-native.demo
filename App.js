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


const {width, height} = Dimensions.get('window');

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules
} from 'react-native';


import {
  GCanvasView,
} from 'react-native-gcanvas';

import EV from './EV';

import { enable, ReactNativeBridge, Image as GImage } from "gcanvas.js";
import getMockData from './stockdata';
import * as ClChart from './clchart/cl.api'

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule;
ReactNativeBridge.Platform = Platform;

ReactNativeBridge.GCanvasModule.setLogLevel(0);



const deviceScale = PixelRatio.get();
const containerLayout = { width:width, height: (height - 200) }
const canvasLayout = { width: containerLayout.width * deviceScale, height: containerLayout.height * deviceScale }

const eventCentral = new EV();

export default class App extends Component<{}> {

  mainCanvasRef = null;

  mainContext = null;

  mainCanvas = null;

  mainChart = null

  cursorCanvasRef = null;

  cursorContext = null;

  cursorCanvas = null;

  cursorChart = null

  initChart = () => {
    if (this.mainChart) {
      return
    }
    const syscfg = {
      scale: deviceScale,
      canvas: eventCentral,
      context: this.mainContext,
      runPlatform: 'react-native',
      eventPlatform: 'react-native',
      axisPlatform: 'phone',
      tools: {
        beforePaint: () => {
          this.mainContext.scale(1 / deviceScale, 1 / deviceScale);
        },
        afterPaint: () => {
          this.mainCanvas._swapBuffers();
        }
      },
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
    this.initChart();
  }

  onCursorCanvasLayout = () => {
    const canvas_tag = findNodeHandle(this.cursorCanvasRef);
    const el = { ref:""+canvas_tag, style: canvasLayout};
    this.cursorCanvas = enable(el, {bridge: ReactNativeBridge, disableAutoSwap: true});
    this.cursorContext = this.cursorCanvas.getContext('2d');
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

  render() {
    return (
      <View>
        <View
          style={{flexDirection: 'row', marginTop: 20, flexWrap: 'wrap'}}
        >
          <Button 
            style={styles.button}
            onPress={() => {
              this.handleMin('SH000001')
            }}
            title={'SH000001 MIN'}
          />
          <Button 
            style={styles.button}
            onPress={() => {
              this.handleMin('SZ300545')
            }}
            title={'SZ300545 MIN'}
          />
          <Button 
            style={styles.button}
            onPress={() => {
              this.handleKline('SZ300545', 'DAY')
            }}
            title={'SZ300545 DAY'}
          />
          <Button 
            style={styles.button}
            onPress={() => {
              this.handleKline('SZ300545', 'WEEK')
            }}
            title={'SZ300545 WEEK'}
          />
          <Button 
            style={styles.button}
            onPress={() => {
              this.handleSeer()
            }}
            title={'SZ300545 SEER'}
          />
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
  button: {
    width: 80,
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 10,
    top:20,
    height :40
  }
});
