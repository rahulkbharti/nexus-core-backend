import { Resend } from 'resend';

const resend = new Resend('re_eGP1QJJX_Ji1iq6oinyXWX3nPwhJArNCH');

(async function () {
    const { data, error } = await resend.emails.send({
        from: 'Acme <noreply@rahulkbharti.me>',
        to: ['sitimi2995@gddcorp.com'],
        subject: 'Hello World',
        html: '<strong>It works!</strong>',
    });

    if (error) {
        return console.error({ error });
    }

    console.log({ data });
})();