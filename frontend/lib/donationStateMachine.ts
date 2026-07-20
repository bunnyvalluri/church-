/**
 * lib/donationStateMachine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Deterministic finite state machine for the KCM Donation Management Agent.
 *
 * Design principles:
 *  • Every state transition is explicit and logged
 *  • Invalid transitions are rejected (no silent state corruption)
 *  • State is serializable (can be stored in DB or sent over wire)
 *  • Zero external dependencies (no XState)
 *
 * State flow:
 *  IDLE → AMOUNT_SELECTED → DONOR_FILLED → ORDER_CREATING → ORDER_CREATED
 *    → QR_DISPLAYED → PAYMENT_WAITING → PAYMENT_PROCESSING → PAYMENT_VERIFIED
 *    → RECEIPT_GENERATING → RECEIPT_GENERATED → NOTIFICATIONS_SENDING
 *    → COMPLETED | FAILED | EXPIRED | CANCELLED
 */

// ─── State Definitions ────────────────────────────────────────────────────────

export const DonationState = {
  IDLE: 'IDLE',
  AMOUNT_SELECTED: 'AMOUNT_SELECTED',
  DONOR_FILLED: 'DONOR_FILLED',
  ORDER_CREATING: 'ORDER_CREATING',
  ORDER_CREATED: 'ORDER_CREATED',
  QR_DISPLAYED: 'QR_DISPLAYED',
  PAYMENT_WAITING: 'PAYMENT_WAITING',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  RECEIPT_GENERATING: 'RECEIPT_GENERATING',
  RECEIPT_GENERATED: 'RECEIPT_GENERATED',
  NOTIFICATIONS_SENDING: 'NOTIFICATIONS_SENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type DonationStateType = (typeof DonationState)[keyof typeof DonationState];

// ─── Event Definitions ────────────────────────────────────────────────────────

export const DonationEvent = {
  SELECT_AMOUNT: 'SELECT_AMOUNT',
  FILL_DONOR_INFO: 'FILL_DONOR_INFO',
  CREATE_ORDER: 'CREATE_ORDER',
  ORDER_SUCCESS: 'ORDER_SUCCESS',
  ORDER_FAILED: 'ORDER_FAILED',
  DISPLAY_QR: 'DISPLAY_QR',
  START_POLLING: 'START_POLLING',
  PAYMENT_DETECTED: 'PAYMENT_DETECTED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  QR_EXPIRED: 'QR_EXPIRED',
  START_RECEIPT: 'START_RECEIPT',
  RECEIPT_READY: 'RECEIPT_READY',
  RECEIPT_FAILED: 'RECEIPT_FAILED',
  SEND_NOTIFICATIONS: 'SEND_NOTIFICATIONS',
  NOTIFICATIONS_COMPLETE: 'NOTIFICATIONS_COMPLETE',
  COMPLETE: 'COMPLETE',
  FAIL: 'FAIL',
  EXPIRE: 'EXPIRE',
  CANCEL: 'CANCEL',
  RESET: 'RESET',
} as const;

export type DonationEventType = (typeof DonationEvent)[keyof typeof DonationEvent];

// ─── Context / Extended State ─────────────────────────────────────────────────

export interface DonationContext {
  sessionId?: string;
  donationId?: string;
  receiptId?: string;
  receiptNumber?: string;
  orderId?: string;
  referenceNumber?: string;

  amount?: number;
  currency: string;
  purposeCode?: string;
  purposeName?: string;
  branchId?: string;
  branchName?: string;

  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  isAnonymous: boolean;

  qrCodeBase64?: string;
  upiUri?: string;
  upiId?: string;
  expiresAt?: Date;

  paymentId?: string;
  utr?: string;

  notificationStatus: {
    email: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
    sms: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
    whatsapp: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
    push: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  };

  error?: string;
  retryCount: number;
  lastEventAt: Date;
}

// ─── Transition Table ─────────────────────────────────────────────────────────

type TransitionMap = {
  [S in DonationStateType]?: Partial<Record<DonationEventType, DonationStateType>>;
};

const TRANSITIONS: TransitionMap = {
  [DonationState.IDLE]: {
    [DonationEvent.SELECT_AMOUNT]: DonationState.AMOUNT_SELECTED,
  },
  [DonationState.AMOUNT_SELECTED]: {
    [DonationEvent.FILL_DONOR_INFO]: DonationState.DONOR_FILLED,
    [DonationEvent.SELECT_AMOUNT]: DonationState.AMOUNT_SELECTED, // re-select
    [DonationEvent.CANCEL]: DonationState.CANCELLED,
  },
  [DonationState.DONOR_FILLED]: {
    [DonationEvent.CREATE_ORDER]: DonationState.ORDER_CREATING,
    [DonationEvent.SELECT_AMOUNT]: DonationState.AMOUNT_SELECTED, // back
    [DonationEvent.CANCEL]: DonationState.CANCELLED,
  },
  [DonationState.ORDER_CREATING]: {
    [DonationEvent.ORDER_SUCCESS]: DonationState.ORDER_CREATED,
    [DonationEvent.ORDER_FAILED]: DonationState.FAILED,
  },
  [DonationState.ORDER_CREATED]: {
    [DonationEvent.DISPLAY_QR]: DonationState.QR_DISPLAYED,
    [DonationEvent.CANCEL]: DonationState.CANCELLED,
  },
  [DonationState.QR_DISPLAYED]: {
    [DonationEvent.START_POLLING]: DonationState.PAYMENT_WAITING,
    [DonationEvent.QR_EXPIRED]: DonationState.EXPIRED,
    [DonationEvent.CANCEL]: DonationState.CANCELLED,
  },
  [DonationState.PAYMENT_WAITING]: {
    [DonationEvent.PAYMENT_DETECTED]: DonationState.PAYMENT_PROCESSING,
    [DonationEvent.QR_EXPIRED]: DonationState.EXPIRED,
    [DonationEvent.CANCEL]: DonationState.CANCELLED,
  },
  [DonationState.PAYMENT_PROCESSING]: {
    [DonationEvent.PAYMENT_CONFIRMED]: DonationState.PAYMENT_VERIFIED,
    [DonationEvent.PAYMENT_FAILED]: DonationState.FAILED,
  },
  [DonationState.PAYMENT_VERIFIED]: {
    [DonationEvent.START_RECEIPT]: DonationState.RECEIPT_GENERATING,
  },
  [DonationState.RECEIPT_GENERATING]: {
    [DonationEvent.RECEIPT_READY]: DonationState.RECEIPT_GENERATED,
    [DonationEvent.RECEIPT_FAILED]: DonationState.RECEIPT_GENERATED, // soft-fail: proceed
  },
  [DonationState.RECEIPT_GENERATED]: {
    [DonationEvent.SEND_NOTIFICATIONS]: DonationState.NOTIFICATIONS_SENDING,
  },
  [DonationState.NOTIFICATIONS_SENDING]: {
    [DonationEvent.NOTIFICATIONS_COMPLETE]: DonationState.COMPLETED,
    [DonationEvent.COMPLETE]: DonationState.COMPLETED,
  },
  [DonationState.FAILED]: {
    [DonationEvent.RESET]: DonationState.IDLE,
    [DonationEvent.CREATE_ORDER]: DonationState.ORDER_CREATING, // retry
  },
  [DonationState.EXPIRED]: {
    [DonationEvent.RESET]: DonationState.IDLE,
    [DonationEvent.CREATE_ORDER]: DonationState.ORDER_CREATING, // new order
  },
  [DonationState.CANCELLED]: {
    [DonationEvent.RESET]: DonationState.IDLE,
  },
};

// ─── Terminal states (no more transitions) ────────────────────────────────────
export const TERMINAL_STATES = new Set<DonationStateType>([DonationState.COMPLETED]);

// ─── State Machine Instance ───────────────────────────────────────────────────

export interface StateMachineInstance {
  state: DonationStateType;
  context: DonationContext;
  history: Array<{ from: DonationStateType; to: DonationStateType; event: DonationEventType; at: Date }>;
}

export function createDonationStateMachine(
  initial: Partial<DonationContext> = {}
): StateMachineInstance {
  return {
    state: DonationState.IDLE,
    context: {
      currency: 'INR',
      isAnonymous: false,
      retryCount: 0,
      lastEventAt: new Date(),
      notificationStatus: {
        email: 'PENDING',
        sms: 'PENDING',
        whatsapp: 'PENDING',
        push: 'PENDING',
      },
      ...initial,
    },
    history: [],
  };
}

// ─── Transition Function ──────────────────────────────────────────────────────

export interface TransitionResult {
  success: boolean;
  nextState: DonationStateType;
  previousState: DonationStateType;
  error?: string;
}

export function transition(
  machine: StateMachineInstance,
  event: DonationEventType,
  contextUpdate: Partial<DonationContext> = {}
): TransitionResult {
  const currentState = machine.state;
  const allowedTransitions = TRANSITIONS[currentState];

  if (!allowedTransitions) {
    return {
      success: false,
      nextState: currentState,
      previousState: currentState,
      error: `State "${currentState}" has no transitions.`,
    };
  }

  const nextState = allowedTransitions[event];

  if (!nextState) {
    return {
      success: false,
      nextState: currentState,
      previousState: currentState,
      error: `Event "${event}" is not valid in state "${currentState}".`,
    };
  }

  // Apply transition
  machine.history.push({ from: currentState, to: nextState, event, at: new Date() });
  machine.state = nextState;
  machine.context = {
    ...machine.context,
    ...contextUpdate,
    lastEventAt: new Date(),
    error: contextUpdate.error ?? undefined,
  };

  return {
    success: true,
    nextState,
    previousState: currentState,
  };
}

// ─── State Helpers ────────────────────────────────────────────────────────────

export function isTerminal(state: DonationStateType): boolean {
  return TERMINAL_STATES.has(state);
}

export function isPaymentActive(state: DonationStateType): boolean {
  return [
    DonationState.QR_DISPLAYED,
    DonationState.PAYMENT_WAITING,
    DonationState.PAYMENT_PROCESSING,
  ].includes(state as any);
}

export function isError(state: DonationStateType): boolean {
  return [DonationState.FAILED, DonationState.EXPIRED, DonationState.CANCELLED].includes(
    state as any
  );
}

/** Map state to wizard UI step (1-4) */
export function stateToWizardStep(state: DonationStateType): 1 | 2 | 3 | 4 {
  if ([DonationState.IDLE, DonationState.AMOUNT_SELECTED].includes(state as any)) return 1;
  if ([DonationState.DONOR_FILLED, DonationState.ORDER_CREATING].includes(state as any)) return 2;
  if (
    [
      DonationState.ORDER_CREATED,
      DonationState.QR_DISPLAYED,
      DonationState.PAYMENT_WAITING,
      DonationState.PAYMENT_PROCESSING,
      DonationState.EXPIRED,
      DonationState.FAILED,
    ].includes(state as any)
  )
    return 3;
  return 4; // PAYMENT_VERIFIED → COMPLETED → SUCCESS screen
}

/** Human-readable state label for UI display */
export function stateLabel(state: DonationStateType): string {
  const labels: Record<DonationStateType, string> = {
    IDLE: 'Ready',
    AMOUNT_SELECTED: 'Amount Selected',
    DONOR_FILLED: 'Donor Info Complete',
    ORDER_CREATING: 'Creating Order…',
    ORDER_CREATED: 'Order Ready',
    QR_DISPLAYED: 'QR Ready — Awaiting Scan',
    PAYMENT_WAITING: 'Awaiting Payment…',
    PAYMENT_PROCESSING: 'Processing Payment…',
    PAYMENT_VERIFIED: 'Payment Confirmed ✓',
    RECEIPT_GENERATING: 'Generating Receipt…',
    RECEIPT_GENERATED: 'Receipt Ready',
    NOTIFICATIONS_SENDING: 'Sending Notifications…',
    COMPLETED: 'Donation Complete 🎉',
    FAILED: 'Payment Failed',
    EXPIRED: 'Session Expired',
    CANCELLED: 'Cancelled',
  };
  return labels[state] || state;
}

/** State color for UI chips */
export function stateColor(state: DonationStateType): 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' {
  if (state === DonationState.COMPLETED) return 'green';
  if (isError(state)) return 'red';
  if ([DonationState.PAYMENT_VERIFIED, DonationState.RECEIPT_GENERATED].includes(state as any)) return 'purple';
  if (isPaymentActive(state)) return 'yellow';
  if ([DonationState.ORDER_CREATING, DonationState.NOTIFICATIONS_SENDING].includes(state as any)) return 'blue';
  return 'gray';
}
