import type { ReactNode } from 'react';
import { Text } from '../atoms/Text.tsx';
import type { MascotName } from '../mascots/art/index.ts';
import { AuthSheet } from '../organisms/AuthSheet.tsx';
import { KitchenScene } from '../organisms/kitchen/KitchenScene.tsx';
import { StageLayout } from './layouts/StageLayout.tsx';

/** The Welcome screen: ready to sign in, with the development test sign-in in the footer, and while Google's sheet is open. */
export const SIGNINTEMPLATE_STATES = ['rest', 'withFooter', 'primaryAction'] as const;

interface SignInTemplateBase {
  /** The name over the kitchen, "Grocs". */
  title: string;
  /** The line under it. */
  tagline: string;
  /** A host in the kitchen was tapped. */
  onMascotPress?: (name: MascotName, line: string) => void;
  /** Below the invite row (or the primary action), in the sheet's own layout. Development builds put the test sign-in here (R53). */
  footer?: ReactNode;
}

export interface SignInTemplateSignInProps extends SignInTemplateBase {
  onContinue?: () => void;
  onOpenInvite?: () => void;
  /** Google's sheet is open. */
  signingIn?: boolean;
  primaryLabel?: never;
  onPrimary?: never;
}

/** One primary action in place of Continue with Google and the invite row (the demo). No Google sheet exists to be open, so signingIn, onContinue and onOpenInvite are not accepted. */
export interface SignInTemplatePrimaryProps extends SignInTemplateBase {
  primaryLabel: string;
  onPrimary: () => void;
  signingIn?: never;
  onContinue?: never;
  onOpenInvite?: never;
}

export type SignInTemplateProps = SignInTemplateSignInProps | SignInTemplatePrimaryProps;

/** template.stage filled for Welcome: the kitchen scene with the whole cast, and the auth sheet. */
export function SignInTemplate(props: SignInTemplateProps) {
  const { title, tagline, onMascotPress, footer } = props;
  return (
    <StageLayout
      wordmark={
        <>
          <Text variant="display" tone="forest" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="heading" align="center">
            {tagline}
          </Text>
        </>
      }
      stage={<KitchenScene {...(onMascotPress ? { onMascotPress } : {})} />}
      sheet={
        props.primaryLabel !== undefined ? (
          <AuthSheet primaryLabel={props.primaryLabel} onPrimary={props.onPrimary} {...(footer ? { footer } : {})} />
        ) : (
          <AuthSheet
            signingIn={props.signingIn ?? false}
            {...(props.onContinue ? { onContinue: props.onContinue } : {})}
            {...(props.onOpenInvite ? { onOpenInvite: props.onOpenInvite } : {})}
            {...(footer ? { footer } : {})}
          />
        )
      }
    />
  );
}
