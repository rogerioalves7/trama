import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* CORREÇÃO AQUI: Adicionado dark:bg-gray-800 e dark:text-white */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    {title}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 outline-none">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-2 text-gray-700 dark:text-gray-300">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}