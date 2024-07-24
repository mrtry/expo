import { useEvent, useReleasingSharedObject } from 'expo';
import { useEffect, useState, useMemo } from 'react';

import type {
  AudioMode,
  AudioSource,
  AudioStatus,
  RecorderState,
  RecordingOptions,
  RecordingStatus,
} from './Audio.types';
import AudioModule from './AudioModule';
import type { AudioPlayer, AudioRecorder } from './AudioModule.types';
import { createRecordingOptions } from './utils/options';
import { resolveSource } from './utils/resolveSource';

export function useAudioPlayer(
  source: AudioSource | string | number | null = null,
  updateInterval: number = 500
): AudioPlayer {
  const parsedSource = resolveSource(source);
  const player = useReleasingSharedObject(
    () => new AudioModule.AudioPlayer(parsedSource, updateInterval),
    [JSON.stringify(parsedSource)]
  );

  return player;
}

export function useAudioPlayerStatus(player: AudioPlayer): AudioStatus {
  const currentStatus = useMemo(() => player.currentStatus, [player.id]);
  return useEvent(player, 'onPlaybackStatusUpdate', currentStatus);
}

export function useAudioRecorder(
  options: RecordingOptions,
  statusListener?: (status: RecordingStatus) => void
): [AudioRecorder, RecorderState] {
  const platformOptions = createRecordingOptions(options);
  const recorder = useReleasingSharedObject(() => {
    return new AudioModule.AudioRecorder(platformOptions);
  }, [JSON.stringify(platformOptions)]);

  const [state, setState] = useState<RecorderState>(recorder.getStatus());

  useEffect(() => {
    const subscription = recorder.addListener('onRecordingStatusUpdate', (status) => {
      statusListener?.(status);
    });
    return () => subscription.remove();
  }, [recorder.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = recorder.getStatus();
      setState(status);
    }, 1000);

    return () => clearInterval(interval);
  }, [recorder.id]);

  return [recorder, state];
}

export async function setIsAudioActiveAsync(active: boolean): Promise<void> {
  return await AudioModule.setIsAudioActiveAsync(active);
}

export async function setAudioModeAsync(mode: AudioMode): Promise<void> {
  return await AudioModule.setAudioModeAsync(mode);
}

export { AudioModule, AudioPlayer, AudioRecorder };
export * from './Audio.types';
