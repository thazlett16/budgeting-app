import type { ButtonProps as RACButtonProps } from 'react-aria-components';
import { composeRenderProps, Button as RACButton } from 'react-aria-components';

import type { ButtonVariants } from '#src/components/ui/button/variants';
import { buttonVariants } from '#src/components/ui/button/variants';

export type ButtonRootProps = RACButtonProps & ButtonVariants;

export function Button(props: ButtonRootProps) {
  return (
    <RACButton
      {...props}
      data-slot="button"
      className={composeRenderProps(props.className, (className, renderProps) =>
        buttonVariants({ ...props, ...renderProps, className }),
      )}
    />
  );
}
