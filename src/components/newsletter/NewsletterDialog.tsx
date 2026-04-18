'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useFormStatus } from 'react-dom'

import type { NewsletterAuthActionState } from '@/app/(frontend)/actions'

type DialogContext = {
  interests: string[]
  returnTo: string
  source: string
}

type Props = {
  authenticateAction: (
    state: NewsletterAuthActionState | undefined,
    formData: FormData,
  ) => Promise<NewsletterAuthActionState>
  context: DialogContext
  dialogKey: number
  isOpen: boolean
  oauthAction: (formData: FormData) => Promise<void>
  onClose: () => void
  providerAvailability: {
    google: boolean
    microsoft: boolean
  }
}

const initialState: NewsletterAuthActionState = {
  error: null,
  success: false,
}

function PendingButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string
  pendingLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <button className="newsletter-dialog__submit" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}

function SocialButton({
  idleLabel,
  provider,
}: {
  idleLabel: string
  provider: 'google' | 'microsoft'
}) {
  return (
    <button className="newsletter-dialog__social-button" type="submit">
      {idleLabel}
      <span>{provider === 'google' ? 'Google' : 'Microsoft'}</span>
    </button>
  )
}

function useDialogLifecycle(isOpen: boolean, onClose: () => void, closeButtonRef: RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      previousActiveElement?.focus()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeButtonRef, isOpen, onClose])
}

function NewsletterCredentialsForm({
  action,
  context,
  onClose,
}: {
  action: (
    state: NewsletterAuthActionState | undefined,
    formData: FormData,
  ) => Promise<NewsletterAuthActionState>
  context: DialogContext
  onClose: () => void
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [state, formAction] = useActionState(action, initialState)

  useEffect(() => {
    if (!state.success || !state.redirectTo) {
      return
    }

    onClose()
    window.location.assign(state.redirectTo)
  }, [onClose, state.redirectTo, state.success])

  return (
    <div className="newsletter-dialog__credentials">
      <div className="newsletter-dialog__toggle" role="tablist" aria-label="Modo de acesso">
        <button
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'is-active' : undefined}
          onClick={() => setMode('login')}
          role="tab"
          type="button"
        >
          Entrar
        </button>
        <button
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'is-active' : undefined}
          onClick={() => setMode('signup')}
          role="tab"
          type="button"
        >
          Criar conta
        </button>
      </div>

      <form action={formAction} className="newsletter-dialog__form">
        <input name="mode" type="hidden" value={mode} />
        <input name="returnTo" type="hidden" value={context.returnTo} />
        <input name="source" type="hidden" value={context.source} />
        <input name="interests" type="hidden" value={context.interests.join(',')} />

        {mode === 'signup' ? (
          <label className="newsletter-dialog__field">
            <span>Nome</span>
            <input autoComplete="name" name="name" placeholder="Seu nome" required type="text" />
          </label>
        ) : null}

        <label className="newsletter-dialog__field">
          <span>E-mail</span>
          <input autoComplete="email" name="email" placeholder="voce@exemplo.com" required type="email" />
        </label>

        <label className="newsletter-dialog__field">
          <span>Senha</span>
          <input
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            name="password"
            placeholder="Digite sua senha"
            required
            type="password"
          />
        </label>

        {state.error ? <p className="newsletter-dialog__error">{state.error}</p> : null}

        <PendingButton
          idleLabel={mode === 'login' ? 'Entrar na newsletter' : 'Criar conta e participar'}
          pendingLabel={mode === 'login' ? 'Entrando...' : 'Criando conta...'}
        />
      </form>
    </div>
  )
}

function formatProviderLabel(provider?: null | string) {
  if (provider === 'google') {
    return 'Google'
  }

  if (provider === 'microsoft') {
    return 'Microsoft'
  }

  return 'E-mail e senha'
}

function buildLogoutReturnTo(fallbackPath: string) {
  if (typeof window === 'undefined') {
    return fallbackPath
  }

  const url = new URL(window.location.href)
  url.searchParams.delete('newsletter')

  if (url.hash === '#newsletter') {
    url.hash = ''
  }

  return `${url.pathname}${url.search}${url.hash}` || fallbackPath
}

export function NewsletterDialog({
  authenticateAction,
  context,
  dialogKey,
  isOpen,
  oauthAction,
  onClose,
  providerAvailability,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useDialogLifecycle(isOpen, onClose, closeButtonRef)

  async function handleSignOut() {
    const callbackUrl = buildLogoutReturnTo(context.returnTo)

    setIsSigningOut(true)
    onClose()

    try {
      await signOut({
        callbackUrl,
        redirect: true,
      })
    } catch (_error) {
      setIsSigningOut(false)
      window.location.assign(callbackUrl)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="newsletter-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        aria-labelledby="newsletter-dialog-title"
        aria-modal="true"
        className="newsletter-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Fechar"
          className="newsletter-dialog__close"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          x
        </button>

        <div className="newsletter-dialog__intro">
          <span className="eyebrow">Newsletter</span>
          <h2 id="newsletter-dialog-title">Entre para receber novidades do blog</h2>
          <p>
            Escolha a forma de acesso que fizer mais sentido para voce e mantenha seu
            acompanhamento em um so lugar.
          </p>
        </div>

        {status === 'authenticated' ? (
          <div className="newsletter-dialog__member">
            <span className="newsletter-dialog__section-title">Inscricao ativa</span>
            <div className="newsletter-dialog__member-card">
              <strong>{session.user?.name || session.user?.email || 'Participacao confirmada'}</strong>
              <span>{session.user?.email || 'Seu acesso esta confirmado.'}</span>
              <span>Metodo de acesso: {formatProviderLabel(session.user?.provider)}</span>
            </div>
            <p className="newsletter-dialog__member-note">
              Sua participacao ja esta ativa. Se quiser, voce pode fechar esta janela e continuar
              navegando.
            </p>
            <div className="newsletter-dialog__member-actions">
              <button
                className="newsletter-dialog__submit newsletter-dialog__submit--secondary"
                disabled={isSigningOut}
                onClick={handleSignOut}
                type="button"
              >
                {isSigningOut ? 'Saindo...' : 'Deslogar'}
              </button>
            </div>
          </div>
        ) : null}

        {status !== 'authenticated' ? (
          <>
            {providerAvailability.google || providerAvailability.microsoft ? (
              <div className="newsletter-dialog__social">
                <span className="newsletter-dialog__section-title">Entrar com login automatico</span>

                {providerAvailability.google ? (
                  <form action={oauthAction}>
                    <input name="provider" type="hidden" value="google" />
                    <input name="returnTo" type="hidden" value={context.returnTo} />
                    <input name="source" type="hidden" value={context.source} />
                    <input name="interests" type="hidden" value={context.interests.join(',')} />
                    <SocialButton idleLabel="Continuar com" provider="google" />
                  </form>
                ) : null}

                {providerAvailability.microsoft ? (
                  <form action={oauthAction}>
                    <input name="provider" type="hidden" value="microsoft" />
                    <input name="returnTo" type="hidden" value={context.returnTo} />
                    <input name="source" type="hidden" value={context.source} />
                    <input name="interests" type="hidden" value={context.interests.join(',')} />
                    <SocialButton idleLabel="Continuar com" provider="microsoft" />
                  </form>
                ) : null}
              </div>
            ) : null}

            <NewsletterCredentialsForm
              action={authenticateAction}
              context={context}
              key={dialogKey}
              onClose={onClose}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
