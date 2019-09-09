/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name LaunchInstanceSourceController
   * @description
   * The `LaunchInstanceSourceController` controller provides functions for
   * configuring the source step of the Launch Instance Wizard.
   *
   */
  var push = [].push;

  angular
    .module('horizon.dashboard.f5services.workflow.launch-instance')
    .controller('LaunchInstanceSourceController', LaunchInstanceSourceController);

  LaunchInstanceSourceController.$inject = [
    '$scope',
    'horizon.dashboard.f5services.workflow.launch-instance.boot-source-types',
    'bytesFilter',
    'dateFilter',
    'decodeFilter',
    'diskFormatFilter',
    'gbFilter',
    'horizon.dashboard.f5services.workflow.launch-instance.basePath',
    'horizon.framework.widgets.transfer-table.events',
    'horizon.framework.widgets.magic-search.events'
  ];

  function LaunchInstanceSourceController(
    $scope,
    bootSourceTypes,
    bytesFilter,
    dateFilter,
    decodeFilter,
    diskFormatFilter,
    gbFilter,
    basePath,
    events,
    magicSearchEvents
  ) {

    var ctrl = this;

    // Error text for invalid fields
    /*eslint-disable max-len */
    // ctrl.bootSourceTypeError = gettext('Volumes can only be attached to 1 active instance at a time. Please either set your instance count to 1 or select a different source type.');
    /*eslint-enable max-len */

    // // toggle button label/value defaults
    // ctrl.toggleButtonOptions = [
    //   // { label: gettext('Yes'), value: true },
    //   { label: gettext('No'), value: false }
    // ];

    /*
     * Boot Sources
     */
    // ctrl.updateBootSourceSelection = updateBootSourceSelection;
    var selection = ctrl.selection = $scope.model.newInstanceSpec.source;

    /*
     * Transfer table
     */
    ctrl.tableHeadCells = [
      { text: gettext('Name') },
      { text: gettext('Updated') },
      { text: gettext('Size') },
      { text: gettext('Type') },
      { text: gettext('Visibility') }
    ];

    // Map Visibility data so we can decode true/false to Public/Private
    var _visibilitymap = { true: gettext('Public'), false: gettext('Private') };

    ctrl.tableBodyCells = [
      { key: 'name', classList: ['hi-light', 'word-break'] },
      { key: 'updated_at', filter: dateFilter, filterArg: 'short' },
      { key: 'size', filter: bytesFilter, classList: ['number'] },
      { key: 'disk_format', filter: diskFormatFilter, filterRawData: true },
      { key: 'is_public', filter: decodeFilter, filterArg: _visibilitymap }
    ];
    // ctrl.tableData = {
    //   available: [],
    //   allocated: selection,
    //   displayedAvailable: [],
    //   displayedAllocated: []
    // };

    ctrl.tableData = {
      available: $scope.model.images,
      allocated: selection,
      displayedAvailable: $scope.model.images,
      displayedAllocated: selection
    };

    ctrl.helpText = {};
    ctrl.sourceDetails = basePath + 'source/source-details.html';

    // var bootSources = {
    //   image: {
    //     available: $scope.model.images,
    //     allocated: selection,
    //     displayedAvailable: $scope.model.images,
    //     displayedAllocated: selection
    //   },
    // };

    var diskFormats = [
      { label: gettext('AKI'), key: 'aki' },
      { label: gettext('AMI'), key: 'ami' },
      { label: gettext('ARI'), key: 'ari' },
      { label: gettext('Docker'), key: 'docker' },
      { label: gettext('ISO'), key: 'iso' },
      { label: gettext('OVA'), key: 'ova' },
      { label: gettext('QCOW2'), key: 'qcow2' },
      { label: gettext('RAW'), key: 'raw' },
      { label: gettext('VDI'), key: 'vdi' },
      { label: gettext('VHD'), key: 'vhd' },
      { label: gettext('VMDK'), key: 'vmdk' }
    ];

    

    // Mapping for dynamic table data
    var tableBodyCellsMap = {
      image: [
        { key: 'name', classList: ['hi-light', 'word-break'] },
        { key: 'updated_at', filter: dateFilter, filterArg: 'short' },
        { key: 'size', filter: bytesFilter, classList: ['number'] },
        { key: 'disk_format', filter: diskFormatFilter, filterRawData: true },
        { key: 'is_public', filter: decodeFilter, filterArg: _visibilitymap }
      ],
    };

    /**
     * Creates a map of functions that sort by the key at a given index for
     * the selected object
     */
    ctrl.sortByField = [];

    var sortFunction = function (columnIndex, comparedObject) {
      var cell = tableBodyCellsMap.image;
      var key = cell[columnIndex].key;
      return comparedObject[key];
    };

    for (var i = 0; i < 5; ++i) {
      ctrl.sortByField.push(sortFunction.bind(null, i));
    }

    /**
     * Filtering - client-side MagicSearch
     */
    ctrl.sourceFacets = [];

    // // All facets for source step
    // var facets = {
    //   created: {
    //     label: gettext('Created'),
    //     name: 'created_at',
    //     singleton: true
    //   },
    //   description: {
    //     label: gettext('Description'),
    //     name: 'description',
    //     singleton: true
    //   },
    //   encrypted: {
    //     label: gettext('Encrypted'),
    //     name: 'encrypted',
    //     singleton: true,
    //     options: [
    //       { label: gettext('Yes'), key: 'true' },
    //       { label: gettext('No'), key: 'false' }
    //     ]
    //   },
    //   name: {
    //     label: gettext('Name'),
    //     name: 'name',
    //     singleton: true
    //   },
    //   size: {
    //     label: gettext('Size'),
    //     name: 'size',
    //     singleton: true
    //   },
    //   status: {
    //     label: gettext('Status'),
    //     name: 'status',
    //     singleton: true,
    //     options: [
    //       { label: gettext('Available'), key: 'available' },
    //       { label: gettext('Creating'), key: 'creating' },
    //       { label: gettext('Deleting'), key: 'deleting' },
    //       { label: gettext('Error'), key: 'error' },
    //       { label: gettext('Error Deleting'), key: 'error_deleting' }
    //     ]
    //   },
    //   type: {
    //     label: gettext('Type'),
    //     name: 'disk_format',
    //     singleton: true,
    //     options: diskFormats
    //   },
    //   updated: {
    //     label: gettext('Updated'),
    //     name: 'updated_at',
    //     singleton: true
    //   },
    //   visibility: {
    //     label: gettext('Visibility'),
    //     name: 'is_public',
    //     singleton: true,
    //     options: [
    //       { label: gettext('Public'), key: 'true' },
    //       { label: gettext('Private'), key: 'false' }
    //     ]
    //   },
    //   volumeType: {
    //     label: gettext('Type'),
    //     name: 'volume_image_metadata.disk_format',
    //     singleton: true,
    //     options: diskFormats
    //   }
    // };

    // Since available transfer table for Launch Instance Source step is
    // dynamically selected based on Boot Source, we need to update the
    // model here accordingly. Otherwise it will only calculate the items
    // available based on the original selection Boot Source: Image.
    // var bootSourceWatcher = $scope.$watch(
    //   function getBootSource() {
    //     return ctrl.currentBootSource;
    //   },
    //   function onBootSourceChange(newValue, oldValue) {
    //     if (newValue !== oldValue) {
    //       $scope.$broadcast(events.TABLES_CHANGED, {
    //         'data': bootSources[newValue]
    //       });
    //     }
    //   }
    // );

    var imagesWatcher = $scope.$watchCollection(
      function getImages() {
        return $scope.model.images;
      },
      function onImagesChange() {
        $scope.initPromise.then(function () {
          $scope.$applyAsync(function () {
            if ($scope.launchContext.imageId) {
              setSourceImageWithId($scope.launchContext.imageId);
            }
          });
        });
      }
    );

    var flavorWatcher = $scope.$watchCollection(function () {
      return $scope.model.newInstanceSpec.flavor;
    }, function setVolumeSize() {
      // Set the volume size if a flavor is selected and it requires
      // more disk space than what the user specified.
      var newInstanceSpec = $scope.model.newInstanceSpec;
      var flavor = newInstanceSpec.flavor;
      if (flavor && (newInstanceSpec.vol_size < flavor.disk)) {
        newInstanceSpec.vol_size = flavor.disk;
      }
    });

    // Explicitly remove watchers on destruction of this controller
    $scope.$on('$destroy', function () {
       //allowedBootSourcesWatcher();
      // newSpecWatcher();
      // allocatedWatcher();
      // bootSourceWatcher();
      imagesWatcher();
      flavorWatcher();
    });

    function refillArray(arrayToRefill, contentArray) {
      arrayToRefill.length = 0;
      Array.prototype.push.apply(arrayToRefill, contentArray);
    }

    function findSourceById(sources, id) {
      var len = sources.length;
      var source;
      for (var i = 0; i < len; i++) {
        source = sources[i];
        if (source.id === id) {
          return source;
        }
      }
    }

    function setSourceImageWithId(id) {
      var pre = findSourceById($scope.model.images, id);
      if (pre) {
        changeBootSource(bootSourceTypes.IMAGE, [pre]);
        $scope.model.newInstanceSpec.source_type = {
          type: bootSourceTypes.IMAGE,
          label: gettext('Image')
        };
        ctrl.currentBootSource = bootSourceTypes.IMAGE;
      }
    }
  }
})();
