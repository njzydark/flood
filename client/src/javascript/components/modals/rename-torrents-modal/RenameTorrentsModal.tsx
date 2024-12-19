import {FC, useState} from 'react';
import {useLingui} from '@lingui/react';

import {Form, FormRow, Textbox} from '@client/ui';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Modal from '../Modal';
import ModalActions from '../ModalActions';

const RenameTorrents: FC = () => {
  const {i18n} = useLingui();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  return (
    <Modal
      heading={i18n._('torrents.rename.heading')}
      content={
        <div className="modal__content">
          <Form
            className="inverse"
            onSubmit={({formData}) => {
              const hashes = TorrentStore.selectedTorrents;
              if (!hashes.length || hashes.length > 1) {
                return false;
              }

              if (!formData.oldName || !formData.newName) {
                return false;
              }

              setIsSubmitting(true);
              const currentTorrent = TorrentStore.torrents[hashes[0]];
              TorrentActions.renameTorrents({
                hashes,
                directory: currentTorrent.directory as string,
                oldName: formData.oldName as string,
                newName: formData.newName as string,
              }).then((res: unknown) => {
                if (res === false) {
                  return;
                }
                UIStore.setActiveModal(null);
                setIsSubmitting(false);
              });
            }}
          >
            <FormRow>
              <Textbox
                id="oldName"
                label={i18n._('torrents.rename.old_name.label')}
                placeholder={i18n._('torrents.rename.old_name.label')}
                defaultValue={TorrentStore.selectedTorrents.map((hash: string) => {
                  return TorrentStore.torrents[hash].name;
                })}
                disabled
              />
            </FormRow>
            <FormRow>
              <Textbox
                id="newName"
                label={i18n._('torrents.rename.new_name.label')}
                placeholder={i18n._('torrents.rename.new_name.label')}
                defaultValue={TorrentStore.selectedTorrents.map((hash: string) => {
                  return TorrentStore.torrents[hash].name;
                })}
              />
            </FormRow>
            <ModalActions
              actions={[
                {
                  content: i18n._('button.cancel'),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: i18n._('torrents.rename.button.set.rename'),
                  isLoading: isSubmitting,
                  submit: true,
                  type: 'primary',
                },
              ]}
            />
          </Form>
        </div>
      }
    />
  );
};

export default RenameTorrents;
