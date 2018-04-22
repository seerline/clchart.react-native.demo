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

import EV from './EV';

import { enable, ReactNativeBridge, Image as GImage } from "gcanvas.js";
import getMockData from './stockdata';
import * as ClChart from './clchart/cl.api'

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule;
ReactNativeBridge.Platform = Platform;

ReactNativeBridge.GCanvasModule.setLogLevel(0);



const deviceScale = PixelRatio.get();
const containerLayout = { width:width, height: (height) }
const canvasLayout = { width: containerLayout.width * deviceScale, height: containerLayout.height * deviceScale }

const eventCentral = new EV();

let count = 0

export default class App extends Component<{}> {

  mainCanvasRef = null;

  mainContext = null;

  mainCanvas = null;

  mainChart = null

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
  }

  clear = () => {
    this.mainContext.clearRect(0, 0, width * deviceScale, height * deviceScale)
  }

  drawLine = (x, y) => {
    this.clear()
    x *= deviceScale
    y *= deviceScale
    this.mainContext._beforePaint();
    this.mainContext.beginPath();
    this.mainContext.lineWidth = 1
    this.mainContext.moveTo(0, y)
    this.mainContext.lineTo(width * deviceScale, y)
    this.mainContext.moveTo(x, 0)
    this.mainContext.lineTo(x, height * deviceScale)
    this.mainContext.stroke();
    this.mainContext._afterPaint()
  }

  render() {
    return (
      <View>
        <View
          style={[containerLayout, styles.canvasContainer]}
          onTouchStart={(evt) => {
            evt.nativeEvent.offsetX = evt.nativeEvent.locationX
            evt.nativeEvent.offsetY = evt.nativeEvent.locationY
            eventCentral.emit('touchstart', evt.nativeEvent)
          }}
          onTouchMove={(evt) => {
            // evt.nativeEvent.offsetX = evt.nativeEvent.locationX
            // evt.nativeEvent.offsetY = evt.nativeEvent.locationY
            // eventCentral.emit('touchmove', evt.nativeEvent)         
            // alert('dd')
            this.drawLine(evt.nativeEvent.locationX, evt.nativeEvent.locationY)
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
