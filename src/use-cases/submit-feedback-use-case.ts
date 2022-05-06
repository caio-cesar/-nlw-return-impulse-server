import { MailAdapter } from "../adapters/mail-adapter";
import { FeedbacksRepository } from "../repositories/feedbacks-repository";

interface SubmitFeedbackUseCaseRequest {
    type: string;
    comment: string;
    screenShot?: string;
}

export class SubmitFeedbackUseCase {

    constructor(private feedbacksRepository: FeedbacksRepository,
        private mailAdapter: MailAdapter) {
    }

    async execute(request: SubmitFeedbackUseCaseRequest) {
        const { type, comment, screenShot } = request;

        if (screenShot && !screenShot.startsWith('data:image/png;base64')) {
            throw new Error('Invalid screenshot format.');
        }

        if (!type) {
            throw new Error('Type is required.')
        }

        if (!comment) {
            throw new Error('Comment is required.')
        }

        await this.feedbacksRepository.create({
            type,
            comment,
            screenShot
        })

        await this.mailAdapter.sendMail({
            subject: 'Novo feedback',
            body: [
                `<div style="font-family: sans-serif; font-size: 16px; color: #222;">`,
                `<p>Tipo do feedback: ${type}</p>`,
                `<p>Comentário do feedback: ${comment}</p>`,
                screenShot? `<img src="${screenShot}"/>` : ``,
                `</div>`
            ].join('\n')
        })
    }
}