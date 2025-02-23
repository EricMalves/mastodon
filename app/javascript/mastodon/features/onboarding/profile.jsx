import { useState, useMemo, useCallback, createRef } from 'react';

import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';


import { ReactComponent as AddPhotoAlternateIcon } from '@material-symbols/svg-600/outlined/add_photo_alternate.svg';
import { ReactComponent as EditIcon } from '@material-symbols/svg-600/outlined/edit.svg';
import Toggle from 'react-toggle';

import { updateAccount } from 'mastodon/actions/accounts';
import { Button } from 'mastodon/components/button';
import { ColumnBackButton } from 'mastodon/components/column_back_button';
import { Icon } from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import { me } from 'mastodon/initial_state';
import { useAppSelector } from 'mastodon/store';
import { unescapeHTML } from 'mastodon/utils/html';

const messages = defineMessages({
  uploadHeader: { id: 'onboarding.profile.upload_header', defaultMessage: 'Upload profile header' },
  uploadAvatar: { id: 'onboarding.profile.upload_avatar', defaultMessage: 'Upload profile picture' },
});

export const Profile = () => {
  const account = useAppSelector(state => state.getIn(['accounts', me]));
  const [displayName, setDisplayName] = useState(account.get('display_name'));
  const [note, setNote] = useState(unescapeHTML(account.get('note')));
  const [avatar, setAvatar] = useState(null);
  const [header, setHeader] = useState(null);
  const [discoverable, setDiscoverable] = useState(account.get('discoverable'));
  const [indexable, setIndexable] = useState(account.get('indexable'));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState();
  const avatarFileRef = createRef();
  const headerFileRef = createRef();
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();

  const handleDisplayNameChange = useCallback(e => {
    setDisplayName(e.target.value);
  }, [setDisplayName]);

  const handleNoteChange = useCallback(e => {
    setNote(e.target.value);
  }, [setNote]);

  const handleDiscoverableChange = useCallback(e => {
    setDiscoverable(e.target.checked);
  }, [setDiscoverable]);

  const handleIndexableChange = useCallback(e => {
    setIndexable(e.target.checked);
  }, [setIndexable]);

  const handleAvatarChange = useCallback(e => {
    setAvatar(e.target?.files?.[0]);
  }, [setAvatar]);

  const handleHeaderChange = useCallback(e => {
    setHeader(e.target?.files?.[0]);
  }, [setHeader]);

  const avatarPreview = useMemo(() => avatar ? URL.createObjectURL(avatar) : account.get('avatar'), [avatar, account]);
  const headerPreview = useMemo(() => header ? URL.createObjectURL(header) : account.get('header'), [header, account]);

  const handleSubmit = useCallback(() => {
    setIsSaving(true);

    dispatch(updateAccount({
      displayName,
      note,
      avatar,
      header,
      discoverable,
      indexable,
    })).then(() => history.push('/start/follows')).catch(err => {
      setIsSaving(false);
      setErrors(err.response.data.details);
    });
  }, [dispatch, displayName, note, avatar, header, discoverable, indexable, history]);

  return (
    <>
      <ColumnBackButton />

      <div className='scrollable privacy-policy'>
        <div className='column-title'>
          <h3><FormattedMessage id='onboarding.profile.title' defaultMessage='Profile setup' /></h3>
          <p><FormattedMessage id='onboarding.profile.lead' defaultMessage='You can always complete this later in the settings, where even more customization options are available.' /></p>
        </div>

        <div className='simple_form'>
          <div className='onboarding__profile'>
            <label className={classNames('app-form__header-input', { selected: !!headerPreview, invalid: !!errors?.header })} title={intl.formatMessage(messages.uploadHeader)}>
              <input
                type='file'
                hidden
                ref={headerFileRef}
                accept='image/*'
                onChange={handleHeaderChange}
              />

              {headerPreview && <img src={headerPreview} alt='' />}

              <Icon icon={headerPreview ? EditIcon : AddPhotoAlternateIcon} />
            </label>

            <label className={classNames('app-form__avatar-input', { selected: !!avatarPreview, invalid: !!errors?.avatar })} title={intl.formatMessage(messages.uploadAvatar)}>
              <input
                type='file'
                hidden
                ref={avatarFileRef}
                accept='image/*'
                onChange={handleAvatarChange}
              />

              {avatarPreview && <img src={avatarPreview} alt='' />}

              <Icon icon={avatarPreview ? EditIcon : AddPhotoAlternateIcon} />
            </label>
          </div>

          <div className={classNames('input with_block_label', { field_with_errors: !!errors?.display_name })}>
            <label htmlFor='display_name'><FormattedMessage id='onboarding.profile.display_name' defaultMessage='Display name' /></label>
            <span className='hint'><FormattedMessage id='onboarding.profile.display_name_hint' defaultMessage='Your full name or your fun name…' /></span>
            <div className='label_input'>
              <input id='display_name' type='text' value={displayName} onChange={handleDisplayNameChange} maxLength={30} />
            </div>
          </div>

          <div className={classNames('input with_block_label', { field_with_errors: !!errors?.note })}>
            <label htmlFor='note'><FormattedMessage id='onboarding.profile.note' defaultMessage='Bio' /></label>
            <span className='hint'><FormattedMessage id='onboarding.profile.note_hint' defaultMessage='You can @mention other people or #hashtags…' /></span>
            <div className='label_input'>
              <textarea id='note' value={note} onChange={handleNoteChange} maxLength={500} />
            </div>
          </div>
        </div>

        <label className='report-dialog-modal__toggle'>
          <Toggle checked={discoverable} onChange={handleDiscoverableChange} />
          <FormattedMessage id='onboarding.profile.discoverable' defaultMessage='Feature profile and posts in discovery algorithms' />
        </label>

        <label className='report-dialog-modal__toggle'>
          <Toggle checked={indexable} onChange={handleIndexableChange} />
          <FormattedMessage id='onboarding.profile.indexable' defaultMessage='Include public posts in search results' />
        </label>

        <div className='onboarding__footer'>
          <Button block onClick={handleSubmit} disabled={isSaving}>{isSaving ? <LoadingIndicator /> : <FormattedMessage id='onboarding.profile.save_and_continue' defaultMessage='Save and continue' />}</Button>
        </div>
      </div>
    </>
  );
};
