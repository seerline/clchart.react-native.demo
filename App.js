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
  Button
} from 'react-native';

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules
} from 'react-native';


import {
  GCanvasView,
} from 'react-native-gcanvas';

import { enable, ReactNativeBridge, Image as GImage } from "gcanvas.js";

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule;
ReactNativeBridge.Platform = Platform;

ReactNativeBridge.GCanvasModule.setLogLevel(0);

export default class App extends Component<{}> {

  canvasCtx = null;

  canvasRef = null;

  onPressHandle = () => {
    console.log(">>>>>>>>onPressHandle...start")

    var ref = this.refs.canvas_holder;

    var canvas_tag = findNodeHandle(ref);
    // var canvas_tag = "2";
    var el = { ref:""+canvas_tag, style:{width:414, height:376}};

    ref = enable(el, {bridge: ReactNativeBridge, disableAutoSwap: true});

    this.canvasRef = ref;

    var ctx = ref.getContext('2d');
    

    this.canvasCtx = ctx

    //rect
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 100, 100);

    //rect
    ctx.fillStyle = 'black';
    ctx.fillRect(100, 100, 100, 100);
    ctx.fillRect(25, 205, 414-50, 5);

    //circle
    ctx.arc(200, 315, 100, 0, Math.PI * 2, true);
    ctx.fill();

    var image = new GImage();
    image.onload = function(){
      ctx.drawImage(image, 150, 0);

      ctx.drawImage(image, 150, 450);

      ref._swapBuffers();
    }
    image.src = 'https://gw.alicdn.com/tfs/TB1KwRTlh6I8KJjy0FgXXXXzVXa-225-75.png';


    ref._swapBuffers();

    console.log(">>>>>>>>onPressHandle...end")
  };
  handleOnpress = () => {
    //rect
    this.canvasCtx.fillStyle = 'blue';
    this.canvasCtx.fillRect(200, 200, 100, 100);
    this.canvasRef._swapBuffers();
  }
  render() {
    return (
      <View>
        <Text>
          Click to draw gcanvas
        </Text>
        <Button 
          onPress={this.handleOnpress}
          title={'Click to draw redraw gcanvas'}
        />
        <TouchableHighlight onPress={this.onPressHandle}>
          <GCanvasView ref='canvas_holder' style={styles.gcanvas}>
          </GCanvasView>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gcanvas: {
    top: 20,
    width: 414,
    height :700,
    backgroundColor: '#FF000030'
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
