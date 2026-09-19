import type { UserMessage } from '@deepseek-ai/dsh-llm';
import type { AnnotationStore, SubmissionJournalEntry } from './store.ts';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        'dsh-annotation': {
            kind: 'dsh-annotation';
            schemaVersion: 1;
            setId: string;
            targetUserMessageId: string;
            count: number;
            digest: string;
        };
    }
}
export declare function createAnnotationContextMessage(sessionId: string, journal: SubmissionJournalEntry): UserMessage;
export declare function journalForDirectUser(store: AnnotationStore, sessionId: string, message: UserMessage): SubmissionJournalEntry | undefined;
//# sourceMappingURL=commit-journal.d.ts.map