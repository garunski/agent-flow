import chokidar from 'chokidar';
import EventEmitter from 'events';

export class WorkflowWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher;
  private watchPaths: string[];

  constructor(watchMode: boolean = true) {
    super();

    if (!watchMode) {
      return;
    }

    this.watchPaths = [
      './workflows/**/*.{ts,js,json}',
      './lib/**/*.{ts,js}',
      './config/workflows.json',
    ];

    this.watcher = chokidar.watch(this.watchPaths, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.{ts,js}',
        '**/coverage/**',
      ],
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.watcher
      .on('add', (path) => {
        this.emit('add', path);
      })
      .on('change', (path) => {
        this.emit('change', path);
      })
      .on('unlink', (path) => {
        this.emit('delete', path);
      })
      .on('error', (error) => {
        this.emit('error', error);
      });
  }

  public close(): Promise<void> {
    return this.watcher?.close() || Promise.resolve();
  }
}

