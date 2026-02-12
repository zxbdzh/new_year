/**
 * 设置界面组件测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SettingsScreen } from './SettingsScreen';
import audioReducer from '../store/audioSlice';
import themeReducer from '../store/themeSlice';

// 创建测试用的store
const createTestStore = () => {
  return configureStore({
    reducer: {
      audio: audioReducer,
      theme: themeReducer,
    },
  });
};

describe('SettingsScreen', () => {
  let store: ReturnType<typeof createTestStore>;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = createTestStore();
    mockOnClose = vi.fn();
    mockOnSave = vi.fn();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Provider store={store}>
        <SettingsScreen isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('游戏设置')).toBeInTheDocument();
  });

  it('should display audio settings section', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('音频设置')).toBeInTheDocument();
    expect(screen.getByLabelText(/音乐音量/)).toBeInTheDocument();
    expect(screen.getByLabelText(/音效音量/)).toBeInTheDocument();
  });

  it('should display theme settings section', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('主题设置')).toBeInTheDocument();
    expect(screen.getByText('背景主题')).toBeInTheDocument();
    expect(screen.getByText('倒计时皮肤')).toBeInTheDocument();
  });

  it('should display performance settings section', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('性能设置')).toBeInTheDocument();
    expect(screen.getByText('画质配置')).toBeInTheDocument();
  });

  it('should display countdown calibration section', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('倒计时校准')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const overlay = screen.getByText('游戏设置').closest('.settings-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not call onClose when modal content is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const modal = screen.getByText('游戏设置').closest('.settings-modal');
    if (modal) {
      fireEvent.click(modal);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave and onClose when save button is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should update music volume when slider is changed', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const musicVolumeSlider = screen.getByLabelText(/音乐音量/) as HTMLInputElement;
    fireEvent.change(musicVolumeSlider, { target: { value: '0.5' } });

    // 检查Redux状态是否更新
    const state = store.getState();
    expect(state.audio.config.musicVolume).toBe(0.5);
  });

  it('should update sfx volume when slider is changed', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const sfxVolumeSlider = screen.getByLabelText(/音效音量/) as HTMLInputElement;
    fireEvent.change(sfxVolumeSlider, { target: { value: '0.6' } });

    // 检查Redux状态是否更新
    const state = store.getState();
    expect(state.audio.config.sfxVolume).toBe(0.6);
  });

  it('should toggle music mute when mute button is clicked', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const initialState = store.getState().audio.config.musicMuted;
    
    // 找到音乐静音按钮（第一个静音按钮）
    const muteButtons = screen.getAllByLabelText(/静音|取消静音/);
    fireEvent.click(muteButtons[0]);

    const newState = store.getState().audio.config.musicMuted;
    expect(newState).toBe(!initialState);
  });

  it('should display available themes', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('年夜饭场景')).toBeInTheDocument();
    expect(screen.getByText('庙会场景')).toBeInTheDocument();
    expect(screen.getByText('雪乡场景')).toBeInTheDocument();
  });

  it('should display available skins', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('灯笼样式')).toBeInTheDocument();
    expect(screen.getByText('对联样式')).toBeInTheDocument();
    expect(screen.getByText('生肖样式')).toBeInTheDocument();
  });

  it('should display performance options', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    expect(screen.getByText('低')).toBeInTheDocument();
    expect(screen.getByText('中')).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument();
  });

  it('should allow manual offset input', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const offsetInput = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(offsetInput, { target: { value: '10' } });

    expect(offsetInput.value).toBe('10');
  });

  it('should pass correct settings data to onSave', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    // 修改一些设置
    const musicVolumeSlider = screen.getByLabelText(/音乐音量/) as HTMLInputElement;
    fireEvent.change(musicVolumeSlider, { target: { value: '0.5' } });

    const offsetInput = screen.getByPlaceholderText('0') as HTMLInputElement;
    fireEvent.change(offsetInput, { target: { value: '5' } });

    // 点击保存
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    // 验证传递给onSave的数据
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        musicVolume: 0.5,
        manualOffset: 5,
      })
    );
  });

  it('should display volume percentage correctly', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    const musicVolumeSlider = screen.getByLabelText(/音乐音量/) as HTMLInputElement;
    fireEvent.change(musicVolumeSlider, { target: { value: '0.75' } });

    // 应该显示75%
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should disable volume slider when muted', () => {
    render(
      <Provider store={store}>
        <SettingsScreen isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      </Provider>
    );

    // 点击静音按钮
    const muteButtons = screen.getAllByLabelText(/静音|取消静音/);
    fireEvent.click(muteButtons[0]);

    // 音量滑块应该被禁用
    const musicVolumeSlider = screen.getByLabelText(/音乐音量/) as HTMLInputElement;
    expect(musicVolumeSlider.disabled).toBe(true);
  });
});
