import type { AiProvider } from './types';
import { NvidiaProvider } from './nvidia';

const providers = new Map<string, AiProvider>();

export function registerProvider(provider: AiProvider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string = 'nvidia'): AiProvider {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(`AI provider "${name}" not found. Available: ${[...providers.keys()].join(', ')}`);
  }
  return provider;
}

// Register NVIDIA as default
registerProvider(new NvidiaProvider());
