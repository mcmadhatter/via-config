import React, {Component} from 'react';
import {CenterKey} from './CenterKey';
import {Key} from './Key';
import {KeyOverlay} from './key-overlay';
import {Title} from './title-bar';
import styles from './keyboard.css';
import {
  getKeyboardFromDevice,
  getLayoutFromDevice
} from '../utils/hid-keyboards';
import {MatrixLayout} from '../utils/layout-parser';
import {M6B, ZEAL65, HHKB, parseKLERaw} from '../utils/kle-parser';
import {LayerControl} from './LayerControl';
import {
  getLabelForByte,
  isAlpha,
  isNumericSymbol,
  isNumericOrShiftedSymbol
} from '../utils/key';
const OVERRIDE_DETECT = true;

export class Keyboard extends Component {
  componentWillMount() {
    if (this.useMatrixKeycodes()) {
      this.props.updateFullMatrix();
    }
  }

  componentWillUpdate({activeLayer}) {
    const oldProps = this.props;
    if (oldProps.activeLayer !== activeLayer) {
      this.props.updateFullMatrix();
    }
  }

  chooseKey({label, size, margin}, idx: string, useMatrixKeycodes) {
    const {matrixKeycodes = [], selectedKey, setSelectedKey} = this.props;
    const onClick = evt => {
      evt.stopPropagation();
      setSelectedKey(idx);
    };

    if (useMatrixKeycodes) {
      const byte = matrixKeycodes[parseInt(idx)];
      label = byte ? getLabelForByte(byte, size) : '';
    }

    if (isAlpha(label)) {
      return (
        label && (
          <Key
            key={idx}
            label={label.toUpperCase()}
            size={size}
            indent={margin}
            selected={selectedKey === idx}
            onClick={onClick}
          />
        )
      );
    } else if (isNumericOrShiftedSymbol(label)) {
      return (
        label && (
          <Key
            key={idx}
            label={label.toUpperCase()}
            size={size}
            indent={margin}
            selected={selectedKey === idx}
            onClick={onClick}
          />
        )
      );
    } else if (isNumericSymbol(label)) {
      const topLabel = label[0];
      const bottomLabel = label[label.length - 1];
      return (
        topLabel &&
        bottomLabel && (
          <Key
            key={idx}
            topLabel={topLabel}
            bottomLabel={bottomLabel}
            indent={margin}
            size={size}
            selected={selectedKey === idx}
            onClick={onClick}
          />
        )
      );
    } else {
      return (
        <CenterKey
          key={idx}
          label={label}
          indent={margin}
          size={size}
          selected={selectedKey === idx}
          onClick={onClick}
        />
      );
    }
  }

  // We want to show the default layout from KLE if
  // we can't read the matrix for some reason i.e
  // overriding displaying unconnected devices
  useMatrixKeycodes() {
    return !!this.getDevice().path;
  }

  getDevice() {
    const {selectedKeyboard} = this.props;
    const fakeDevice = {vendorId: 0x5241, productId: 0x060a}; //M60A
    const device = selectedKeyboard || fakeDevice;
    return device;
  }

  render() {
    const {
      activeLayer,
      selectedKey,
      selectedKeyboard,
      selectedTitle,
      clearSelectedKey,
      updateLayer,
      matrixKeycodes = []
    } = this.props;
    const detected = !!selectedKeyboard;
    const device = this.getDevice();
    const keyboard = getKeyboardFromDevice(device);
    const selectedLayout = getLayoutFromDevice(device);
    const matrixLayout = MatrixLayout[keyboard.name];
    const showLayer = selectedTitle === Title.KEYS;
    const useMatrixKeycodes = this.useMatrixKeycodes() && matrixKeycodes;
    let keyCounter = 0;
    return (
      <div onClick={clearSelectedKey} className={styles.keyboardContainer}>
        <div
          className={[
            styles.keyboard,
            (detected || OVERRIDE_DETECT) && styles.detected
          ].join(' ')}
        >
          {selectedLayout.map((arr, row) => (
            <div className={styles.row}>
              {arr.map((key, column) =>
                this.chooseKey(key, `${keyCounter++}`, useMatrixKeycodes)
              )}
            </div>
          ))}
        </div>
        <LayerControl
          showLayer={showLayer}
          updateLayer={updateLayer}
          activeLayer={activeLayer}
        />
        <KeyOverlay
          device={device}
          matrixLayout={matrixLayout}
          matrixKeycodes={matrixKeycodes}
          useMatrixKeycodes={this.useMatrixKeycodes()}
          selectedKey={selectedKey}
        />
      </div>
    );
  }
}
