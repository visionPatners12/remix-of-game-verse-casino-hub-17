// Export unified registry - KISS: Single export point
export { UnifiedPostRegistry, createPostComponent, getCreationComponent } from './UnifiedPostRegistry';
export { registerPostComponents } from './registerComponents';

// Auto-register components on import
import './registerComponents';