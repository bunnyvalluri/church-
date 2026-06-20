/**
 * A highly optimized, generic Least Recently Used (LRU) Cache.
 * Used for server-side query and search caching to avoid redundant database full table scans
 * and ensure lightning-fast (O(1)) response times for popular queries.
 */
class LRUNode<K, V> {
  key: K;
  value: V;
  next: LRUNode<K, V> | null = null;
  prev: LRUNode<K, V> | null = null;

  constructor(key: K, value: V) {
    key = key;
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, LRUNode<K, V>>;
  private head: LRUNode<K, V> | null = null;
  private tail: LRUNode<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<K, LRUNode<K, V>>();
  }

  /**
   * Fetch an item from the cache.
   * Time Complexity: O(1)
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // Move accessed node to the head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  /**
   * Insert or update an item in the cache.
   * Evicts the least recently used (LRU) item if capacity is exceeded.
   * Time Complexity: O(1)
   */
  put(key: K, value: V): void {
    const node = this.cache.get(key);

    if (node) {
      // Update value and move to head
      node.value = value;
      this.moveToHead(node);
    } else {
      // Create new node
      const newNode = new LRUNode(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);

      // Check capacity constraints
      if (this.cache.size > this.capacity) {
        const lru = this.tail;
        if (lru) {
          this.cache.delete(lru.key);
          this.removeNode(lru);
        }
      }
    }
  }

  /**
   * Helper: Add node to the head of the doubly linked list.
   */
  private addToHead(node: LRUNode<K, V>): void {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Helper: Remove an existing node from the doubly linked list.
   */
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Helper: Move node to the head (marking it as most recently used).
   */
  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Clear all items in the cache.
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
}
