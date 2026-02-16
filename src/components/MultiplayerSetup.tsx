/**
 * 多人模式设置组件
 * Feature: new-year-fireworks-game
 * 
 * 处理多人模式的房间选择流程：
 * 1. 输入昵称
 * 2. 选择公共房间或私人房间
 * 3. 连接到服务器
 */

import { useState, useCallback } from 'react';
import { Users, Lock, ArrowLeft } from 'lucide-react';
import type { NetworkSynchronizer } from '../services/NetworkSynchronizer';
import './MultiplayerSetup.css';

interface MultiplayerSetupProps {
  /** 网络同步器实例 */
  networkSynchronizer: NetworkSynchronizer;
  /** 连接成功回调 */
  onConnected: () => void;
  /** 返回菜单回调 */
  onBack: () => void;
}

/**
 * 多人模式设置组件
 */
export function MultiplayerSetup({
  networkSynchronizer,
  onConnected,
  onBack,
}: MultiplayerSetupProps) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'nickname' | 'room'>('nickname');

  /**
   * 验证昵称
   */
  const validateNickname = (value: string): boolean => {
    if (value.length < 1 || value.length > 8) {
      setError('昵称长度必须在1-8个字符之间');
      return false;
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
      setError('昵称只能包含字母、数字和中文');
      return false;
    }
    return true;
  };

  /**
   * 验证房间码
   */
  const validateRoomCode = (value: string): boolean => {
    if (!/^\d{4}$/.test(value)) {
      setError('房间码必须是4位数字');
      return false;
    }
    return true;
  };

  /**
   * 处理昵称提交
   */
  const handleNicknameSubmit = useCallback(() => {
    setError('');
    if (validateNickname(nickname)) {
      setStep('room');
    }
  }, [nickname]);

  /**
   * 处理加入公共房间
   */
  const handleJoinPublic = useCallback(async () => {
    setError('');
    setIsConnecting(true);

    try {
      // 先连接到服务器
      await networkSynchronizer.connect();
      // 加入公共房间
      await networkSynchronizer.joinRoom(nickname, 'public');
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败，请重试');
      setIsConnecting(false);
    }
  }, [nickname, networkSynchronizer, onConnected]);

  /**
   * 处理加入私人房间
   */
  const handleJoinPrivate = useCallback(async () => {
    setError('');
    
    if (!validateRoomCode(roomCode)) {
      return;
    }

    setIsConnecting(true);

    try {
      // 先连接到服务器
      await networkSynchronizer.connect();
      // 加入私人房间
      await networkSynchronizer.joinRoom(nickname, 'private', roomCode);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败，请重试');
      setIsConnecting(false);
    }
  }, [nickname, roomCode, networkSynchronizer, onConnected]);

  /**
   * 处理返回
   */
  const handleBack = useCallback(() => {
    if (step === 'room') {
      setStep('nickname');
      setError('');
    } else {
      onBack();
    }
  }, [step, onBack]);

  return (
    <div className="multiplayer-setup">
      {/* 返回按钮 */}
      <button
        className="back-button"
        onClick={handleBack}
        aria-label="返回"
        disabled={isConnecting}
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      {/* 昵称输入步骤 */}
      {step === 'nickname' && (
        <div className="setup-content">
          <h2 className="setup-title">输入你的昵称</h2>
          <p className="setup-subtitle">1-8个字符，支持中文、字母和数字</p>

          <div className="input-group">
            <input
              type="text"
              className="nickname-input"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNicknameSubmit();
                }
              }}
              placeholder="请输入昵称"
              maxLength={8}
              autoFocus
              aria-label="昵称"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="primary-button"
            onClick={handleNicknameSubmit}
            disabled={!nickname}
          >
            下一步
          </button>
        </div>
      )}

      {/* 房间选择步骤 */}
      {step === 'room' && (
        <div className="setup-content">
          <h2 className="setup-title">选择房间</h2>
          <p className="setup-subtitle">加入公共房间或创建/加入私人房间</p>

          <div className="room-options">
            {/* 公共房间 */}
            <div className="room-card">
              <div className="room-icon">
                <Users size={32} />
              </div>
              <h3 className="room-title">公共房间</h3>
              <p className="room-description">
                与所有在线玩家一起游戏
                <br />
                最多20人同时在线
              </p>
              <button
                className="room-button public-button"
                onClick={handleJoinPublic}
                disabled={isConnecting}
              >
                {isConnecting ? '连接中...' : '加入公共房间'}
              </button>
            </div>

            {/* 私人房间 */}
            <div className="room-card">
              <div className="room-icon">
                <Lock size={32} />
              </div>
              <h3 className="room-title">私人房间</h3>
              <p className="room-description">
                加入或创建私人房间
                <br />
                使用4位数字房间码
              </p>
              <div className="room-code-input-group">
                <input
                  type="text"
                  className="room-code-input"
                  value={roomCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setRoomCode(value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && roomCode.length === 4) {
                      handleJoinPrivate();
                    }
                  }}
                  placeholder="输入房间码"
                  maxLength={4}
                  aria-label="房间码"
                />
              </div>
              <button
                className="room-button private-button"
                onClick={handleJoinPrivate}
                disabled={isConnecting || roomCode.length !== 4}
              >
                {isConnecting ? '连接中...' : '加入/创建房间'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}
