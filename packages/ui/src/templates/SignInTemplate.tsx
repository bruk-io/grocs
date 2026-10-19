import { Text } from '../atoms/Text.tsx';
import type { MascotName } from '../mascots/art/index.ts';
import { AuthSheet } from '../organisms/AuthSheet.tsx';
import { KitchenScene } from '../organisms/kitchen/KitchenScene.tsx';
import { StageLayout } from './layouts/StageLayout.tsx';

/** The Welcome screen: ready to sign in, and while Google's sheet is open. */
export const SIGNINTEMPLATE_STATES = ['rest'] as const;

export interface SignInTemplateProps {
  /** The name over the kitchen, "Grocs". */
  title: string;
  /** The line under it. */
  tagline: string;
  onContinue?: () => void;
  onOpenInvite?: () => void;
  /** Google's sheet is open. */
  signingIn?: boolean;
  /** A host in the kitchen was tapped. */
  onMascotPress?: (name: MascotName, line: string) => void;
}

/** template.stage filled for Welcome: the kitchen scene with the whole cast, and the auth sheet. */
export function SignInTemplate({ title, tagline, onContinue, onOpenInvite, signingIn = false, onMascotPress }: SignInTemplateProps) {
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
      sheet={<AuthSheet signingIn={signingIn} {...(onContinue ? { onContinue } : {})} {...(onOpenInvite ? { onOpenInvite } : {})} />}
    />
  );
}
