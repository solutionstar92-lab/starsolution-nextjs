'use client';

import { useFormStatus } from 'react-dom';
import { Icon } from '@/components/Icon';
import { toggleHidden, deleteRow } from './actions';
import { ConfirmDelete } from '../../ConfirmDelete';

function ToggleButton({ hidden }: { hidden: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`admin-toggle${hidden ? ' is-hidden' : ''}`}
      disabled={pending}
      title={hidden ? 'Hidden from the site — click to publish' : 'Live — click to hide'}
    >
      <Icon name="eye" />
      {pending ? '…' : hidden ? 'Hidden' : 'Live'}
    </button>
  );
}

/** Publish / hide switch. Writes straight through and revalidates the site. */
export function VisibilityToggle({
  entityKey, id, slug, hidden,
}: {
  entityKey: string; id: string; slug?: string | null; hidden: boolean;
}) {
  return (
    <form action={toggleHidden}>
      <input type="hidden" name="__entity" value={entityKey} />
      <input type="hidden" name="__id" value={id} />
      <input type="hidden" name="__slug" value={slug ?? ''} />
      <input type="hidden" name="__next" value={String(!hidden)} />
      <ToggleButton hidden={hidden} />
    </form>
  );
}

/**
 * Delete a content row, behind the typed confirmation.
 *
 * The confirmation itself moved to admin/ConfirmDelete so the leads page could
 * use the same one rather than grow a second, slightly different copy. This
 * keeps the entity-shaped API the two callers already pass.
 */
export function DeleteRow({
  entityKey, id, slug, name, label = 'Delete',
}: {
  entityKey: string; id: string; slug?: string | null; name: string; label?: string;
}) {
  return (
    <ConfirmDelete action={deleteRow} name={name} label={label}>
      <input type="hidden" name="__entity" value={entityKey} />
      <input type="hidden" name="__id" value={id} />
      <input type="hidden" name="__slug" value={slug ?? ''} />
    </ConfirmDelete>
  );
}
