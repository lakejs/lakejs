import { boxes } from '../../src/storage/boxes';
import { icons } from '../../src/icons';
import { query } from '../../src/utils';
import { Nodes } from '../../src/models/nodes';
import { Box } from '../../src/models/box';
import { BoxToolbar } from '../../src/ui/box-toolbar';

const imageUrl = '../assets/images/heaven-lake-256.png';

describe('ui / box-toolbar-ui', () => {

  let container: Nodes;

  before(() => {
    boxes.set('boxToolbarUiTestBox', {
      type: 'inline',
      name: 'boxToolbarUiTestBox',
      value: {
        url: imageUrl,
      },
      render: box => `<img src="${box.value.url}" style="width: 256px; height: 186px;" />`,
    });
    container = query('<div class="lake-container" contenteditable="true"></div>');
    const rootNode = query('<div class="lake-root lake-custom-properties"></div>');
    rootNode.append(container);
    query(document.body).append(rootNode);
  });

  it('box toolbar', () => {
    container.html('<p><lake-box type="inline" name="boxToolbarUiTestBox"></lake-box></p>');
    const box = new Box(container.find('lake-box'));
    box.render();
    const boxToolbar = new BoxToolbar({
      box,
      items: [
        {
          name: 'open',
          type: 'button',
          icon: icons.get('open'),
          tooltip: 'Open',
          onClick: () => { },
        },
        '|',
        {
          name: 'remove',
          type: 'button',
          icon: icons.get('remove'),
          tooltip: 'Remove',
          onClick: () => { },
        },
      ],
    });
    boxToolbar.render();
  });

});
