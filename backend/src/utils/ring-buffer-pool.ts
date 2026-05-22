export class RingBufferPool {
  private buffers: Buffer[];
  private index = 0;

  constructor(
    private readonly bufferSize: number,
    private readonly poolSize: number,
  ) {
    this.buffers = Array.from({ length: poolSize }, () =>
      Buffer.allocUnsafe(this.bufferSize),
    );
  }

  next(): Buffer {
    const buffer = this.buffers[this.index];

    this.index++;

    if (this.index >= this.poolSize) {
      this.index = 0;
    }

    return buffer;
  }
}
