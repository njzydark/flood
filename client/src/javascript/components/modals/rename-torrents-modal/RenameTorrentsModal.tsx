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
  const [torrent] = useState(() => {
    const hashes = TorrentStore.selectedTorrents;
    return hashes.length === 1 ? TorrentStore.torrents[hashes[0]] : undefined;
  });

  return (
    <Modal
      heading={i18n._('torrents.rename.heading')}
      content={
        <div className="modal__content">
          <Form
            className="inverse"
            onSubmit={({formData}) => {
              if (torrent == null || isSubmitting) {
                return false;
              }

              if (typeof formData.newName !== 'string' || !formData.newName) {
                return false;
              }

              setIsSubmitting(true);
              TorrentActions.renameTorrents({
                hashes: [torrent.hash],
                directory: torrent.directory,
                oldName: torrent.name,
                newName: formData.newName,
              }).then((success) => {
                if (success) {
                  UIStore.setActiveModal(null);
                }
                setIsSubmitting(false);
              });
            }}
          >
            <FormRow>
              <Textbox
                id="oldName"
                label={i18n._('torrents.rename.old_name.label')}
                placeholder={i18n._('torrents.rename.old_name.label')}
                defaultValue={torrent?.name}
                disabled
              />
            </FormRow>
            <FormRow>
              <Textbox
                id="newName"
                label={i18n._('torrents.rename.new_name.label')}
                placeholder={i18n._('torrents.rename.new_name.label')}
                defaultValue={torrent?.name}
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
