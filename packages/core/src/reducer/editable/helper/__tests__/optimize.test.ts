/*
 * This file is part of ORY Editor.
 *
 * ORY Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ORY Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with ORY Editor.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license LGPL-3.0
 * @copyright 2016-2018 Aeneas Rekkas
 * @author Aeneas Rekkas <aeneas+oss@aeneas.io>
 *
 */

import expect from 'unexpected';
import equal from 'fast-deep-equal';

import { optimizeCell, optimizeRow } from '../optimize';

describe('optimizeRow', () => {
  [
    {
      in: {
        cells: [],
      },
      out: {
        cells: [],
      },
    },
    {
      in: {
        cells: [
          {
            size: 12,
            rows: [{ cells: [{ plugin: 'foo', size: 12 }] }],
          },
        ],
      },
      out: {
        cells: [{ plugin: 'foo', size: 12 }],
      },
    },
    {
      in: {
        size: 12,
        cells: [
          {
            size: 4,
            rows: [{ cells: [{ plugin: 'bar', size: 12 }] }],
          },
          { plugin: 'foo', size: 8 },
        ],
      },
      out: {
        size: 12,
        cells: [
          { plugin: 'bar', size: 4 },
          { plugin: 'foo', size: 8 },
        ],
      },
    },
  ].forEach((c, k) => {
    it(`should pass test case ${k}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(optimizeRow(c.in as any), 'to equal', c.out);
    });
  });
});

describe('optimizeCell', () => {
  [
    {
      in: {
        rows: [],
      },
      out: {
        rows: [],
      },
    },
    {
      in: {
        rows: [
          {
            cells: [{ rows: [{ cells: [{ plugin: 'foo' }] }] }],
          },
        ],
      },
      out: {
        rows: [{ cells: [{ plugin: 'foo' }] }],
      },
    },
  ].forEach((c, k) => {
    it(`should pass test case ${k}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(equal(c.out, optimizeCell(c.in as any)), 'to be truthy');
    });
  });
});
