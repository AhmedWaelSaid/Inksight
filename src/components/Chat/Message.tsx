import { cn } from '@/lib/utils'
import { ExtendedMessage } from '@/types/message'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { forwardRef } from 'react'
import { Icons } from '../Icons'

interface MessageProps {
  message: ExtendedMessage
  isNextMessageSamePerson: boolean
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-end', {
          'justify-end': message.isUsermessage,
        })}>
        <div
          className={cn(
            'relative flex h-6 w-6 aspect-square items-center justify-center',
            {
              'order-2 bg-green-700 rounded-sm':
                message.isUsermessage,
              'order-1 bg-zinc-800 rounded-sm':
                !message.isUsermessage,
              invisible: isNextMessageSamePerson,
            }
          )}>
          {message.isUsermessage ? (
            <Icons.user className='fill-zinc-200 text-zinc-200 h-3/4 w-3/4' />
          ) : (
            <Icons.logo className='fill-zinc-300 h-3/4 w-3/4' />
          )}
        </div>

        <div
          className={cn(
            'flex flex-col space-y-2 text-base max-w-md mx-2',
            {
              'order-1 items-end': message.isUsermessage,
              'order-2 items-start': !message.isUsermessage,
            }
          )}>
          <div
            className={cn(
              'px-4 py-2 rounded-lg inline-block',
              {
                'bg-green-800 text-white':
                  message.isUsermessage,
                'bg-gray-200 text-gray-900':
                  !message.isUsermessage,
                'rounded-br-none':
                  !isNextMessageSamePerson &&
                  message.isUsermessage,
                'rounded-bl-none':
                  !isNextMessageSamePerson &&
                  !message.isUsermessage,
              }
            )}>
            {typeof message.text === 'string' ? (
              <div
                className={cn('prose', {
                  'text-zinc-50': message.isUsermessage,
                })}>
                <ReactMarkdown>
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              message.text
            )}
            {message.id !== 'loading-message' ? (
              <div
                className={cn(
                  'text-xs select-none mt-2 w-full text-right',
                  {
                    'text-zinc-500': !message.isUsermessage,
                    'text-green-300': message.isUsermessage,
                  }
                )}>
                {format(
                  new Date(message.createdAt),
                  'HH:mm'
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }
)

Message.displayName = 'Message'

export default Message