import { ReactElement } from "react";
import { BasePath } from "../emails/components/BasePath";
import { InviteEmail, InviteEmailSchema } from "../emails/invite";
import MagicLinkEmail from "../emails/magic-link";

import React from "react";
import { Resend } from "resend";
import { z } from "zod";

export const DeliverEmailSchema = z
  .discriminatedUnion("email", [
    z.object({
      email: z.literal("magic_link"),
      magicLink: z.string().url(),
    }),
    InviteEmailSchema,
  ])
  .and(z.object({ to: z.string() }));

export type DeliverEmail = z.infer<typeof DeliverEmailSchema>;

export class EmailClient {
  #client: Resend;
  #imagesBaseUrl: string;
  #from: string;
  #replyTo: string;

  constructor(config: {
    apikey: string;
    imagesBaseUrl: string;
    from: string;
    replyTo: string;
  }) {
    this.#client = new Resend(config.apikey);
    this.#imagesBaseUrl = config.imagesBaseUrl;
    this.#from = config.from;
    this.#replyTo = config.replyTo;
  }

  async send(data: DeliverEmail) {
    const { subject, component } = this.#getTemplate(data);
    return this.#sendEmail({
      to: data.to,
      subject,
      react: <BasePath basePath={this.#imagesBaseUrl}>{component}</BasePath>,
    });
  }

  #getTemplate(data: DeliverEmail): {
    subject: string;
    component: ReactElement;
  } {
    switch (data.email) {
      case "magic_link":
        return {
          subject: "Magic sign-in link for Trigger.dev",
          component: <MagicLinkEmail magicLink={data.magicLink} />,
        };
      case "invite":
        return {
          subject: `You've been invited to join ${data.orgName} on Trigger.dev`,
          component: <InviteEmail {...data} />,
        };
    }
  }

  async #sendEmail({
    to,
    subject,
    react,
  }: {
    to: string;
    subject: string;
    react: ReactElement;
  }) {
    await this.#client.sendEmail({
      from: this.#from,
      to,
      replyTo: this.#replyTo,
      subject,
      react,
    });
  }
}
