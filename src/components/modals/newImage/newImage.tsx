'use client'

import { Modal } from '@/components/ui/custom/modal';
import styles from './newImage.module.scss';
import OptionInput, { ChangeButton } from '@/components/ui/custom/optionInput';
import { useState } from 'react';
import { DialogFilter } from '@tauri-apps/api/dialog';

interface NewImageProps {
    onClose: () => void;
    defaultValue: string;
    dialogFilters: DialogFilter[];
}

export default function NewImage({ onClose, defaultValue, dialogFilters }: NewImageProps) {
    const [path, setPath] = useState<string>(defaultValue);

    return (
        <Modal
            onClose={onClose}
            title='Add Image'
            separator
        >
            <OptionInput
                value={path}
                disabled
            >
                <ChangeButton
                    saveAction={(value) => { setPath(value) }}
                    path=''
                    filters={dialogFilters}
                />
            </OptionInput>
        </Modal>
    );
}
