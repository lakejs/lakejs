import  type { Editor } from '../editor';
import { debug } from '../utils/debug';
import { request } from '../utils/request';
import { Box } from '../models/box';

type UploadConfig = {
  editor: Editor;
  file: File;
  onError?: ()=> void;
  onSuccess?: ()=> void;
};

export function uploadImage(config: UploadConfig): Box {
  const { editor, file, onError, onSuccess} = config;
  const { requestMethod, requestAction, requestTypes } = editor.config.image;
  if (requestTypes.indexOf(file.type) < 0) {
    throw new Error(`Cannot upload file because its type '${file.type}' is not found in ['${requestTypes.join('\', \'')}'].`);
  }
  const box = editor.insertBox('image', {
    url: URL.createObjectURL(file),
    status: 'uploading',
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  });
  const xhr = request({
    onProgress: e => {
      const percentNode = box.node.find('.lake-percent');
      const percent = Math.round(e.percent);
      percentNode.text(`${percent < 100 ? percent : 99} %`);
    },
    onError: (error, body) => {
      debug(error.toString(), body);
      box.updateValue('status', 'error');
      box.render();
      if (onError) {
        onError();
      }
    },
    onSuccess: body => {
      if (!body.url) {
        box.updateValue('status', 'error');
        box.render();
        if (onError) {
          onError();
        }
        return;
      }
      box.updateValue({
        status: 'done',
        url: body.url,
      });
      box.render();
      editor.history.save();
      if (onSuccess) {
        onSuccess();
      }
    },
    file,
    action: requestAction,
    method: requestMethod,
  });
  box.setData('xhr', xhr);
  return box;
}
