import * as exec from '@actions/exec'
import * as cache from '@actions/cache'
import fs from 'fs'
import path from 'path'
import {LibraryChecker} from '../src/libraryChecker'
import {getMockedLogger} from './util'

describe('generate', () => {
  let libraryChecker: LibraryChecker
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue()
    jest.spyOn(cache, 'saveCache').mockResolvedValue(0)
    libraryChecker = new LibraryChecker(__dirname, 'HEAD', {useCache: true})
    jest.spyOn(libraryChecker, 'problems').mockResolvedValue({
      aplusb: 'version',
      unionfind: 'version',
      many_aplusb: 'version'
    })
    jest
      .spyOn(libraryChecker, 'updateTimestampOfCachedFile')
      .mockResolvedValue()
    jest.spyOn(libraryChecker, 'getCacheHash').mockResolvedValue('cache-hash')
  })
  describe('not updated cache', () => {
    test('hit all cache', async () => {
      Object.defineProperty(libraryChecker, 'lastCacheHash', {
        value: 'cache-hash'
      })

      const execMock = jest
        .spyOn(libraryChecker, 'generateCore')
        .mockResolvedValueOnce()
      const mockedLogger = getMockedLogger()
      jest.spyOn(libraryChecker, 'cachedProblems').mockResolvedValue({
        aplusb: 'version',
        unionfind: 'version',
        many_aplusb: 'version'
      })

      await libraryChecker.generate(
        ['aplusb', 'unionfind', 'many_aplusb'],
        () => false
      )
      expect(execMock.mock.calls).toEqual([
        [['aplusb', 'unionfind', 'many_aplusb'], expect.any(Function)]
      ])
      expect(mockedLogger.mock.calls).toEqual([
        ['startGroup', 'generate problems'],
        ['debug', 'cached: aplusb, unionfind, many_aplusb'],
        ['endGroup', '']
      ])
    })
  })

  describe('updated cache', () => {
    test('hit no cache', async () => {
      const execMock = jest
        .spyOn(libraryChecker, 'generateCore')
        .mockResolvedValueOnce()
      const mockedLogger = getMockedLogger()
      jest.spyOn(libraryChecker, 'cachedProblems').mockResolvedValue({})

      await libraryChecker.generate(
        ['aplusb', 'unionfind', 'many_aplusb'],
        () => false
      )
      expect(execMock.mock.calls).toEqual([
        [['aplusb', 'unionfind', 'many_aplusb'], expect.any(Function)]
      ])
      expect(mockedLogger.mock.calls).toEqual([
        ['startGroup', 'generate problems'],
        ['debug', 'cached target is empty'],
        ['endGroup', '']
      ])
    })

    test('hit some cache', async () => {
      const execMock = jest
        .spyOn(libraryChecker, 'generateCore')
        .mockResolvedValueOnce()
      const mockedLogger = getMockedLogger()
      jest.spyOn(libraryChecker, 'cachedProblems').mockResolvedValue({
        aplusb: 'version',
        many_aplusb: 'version'
      })
      await libraryChecker.generate(
        ['aplusb', 'unionfind', 'many_aplusb'],
        () => false
      )
      expect(execMock.mock.calls).toEqual([
        [['aplusb', 'unionfind', 'many_aplusb'], expect.any(Function)]
      ])
      expect(mockedLogger.mock.calls).toEqual([
        ['startGroup', 'generate problems'],
        ['debug', 'cached: aplusb, many_aplusb'],
        ['endGroup', '']
      ])
    })

    test('hit all cache', async () => {
      const execMock = jest
        .spyOn(libraryChecker, 'generateCore')
        .mockResolvedValueOnce()
      const mockedLogger = getMockedLogger()
      jest.spyOn(libraryChecker, 'cachedProblems').mockResolvedValue({
        aplusb: 'version',
        unionfind: 'version',
        many_aplusb: 'version'
      })

      await libraryChecker.generate(
        ['aplusb', 'unionfind', 'many_aplusb'],
        () => false
      )
      expect(execMock.mock.calls).toEqual([
        [['aplusb', 'unionfind', 'many_aplusb'], expect.any(Function)]
      ])
      expect(mockedLogger.mock.calls).toEqual([
        ['startGroup', 'generate problems'],
        ['debug', 'cached: aplusb, unionfind, many_aplusb'],
        ['endGroup', '']
      ])
    })

    test('hit all cache with not found', async () => {
      const execMock = jest
        .spyOn(libraryChecker, 'generateCore')
        .mockResolvedValueOnce()
      const mockedLogger = getMockedLogger()
      jest.spyOn(libraryChecker, 'cachedProblems').mockResolvedValue({
        aplusb: 'version',
        unionfind: 'version',
        many_aplusb: 'version'
      })

      await libraryChecker.generate(
        ['aplusb', 'unionfind', 'many_aplusb', 'notfound', 'anything'],
        () => false
      )
      expect(mockedLogger.mock.calls).toEqual([
        ['warning', 'Problems are not found: notfound, anything'],
        ['startGroup', 'generate problems'],
        ['debug', 'cached: aplusb, unionfind, many_aplusb'],
        ['endGroup', '']
      ])
    })
  })
})

test('problems', async () => {
  jest.clearAllMocks()
  const versions = await fs.promises.readFile(
    path.join(__dirname, 'versions.json')
  )
  jest.spyOn(cache, 'restoreCache').mockResolvedValue('cache key')
  jest.spyOn(exec, 'getExecOutput').mockResolvedValueOnce({
    exitCode: 0,
    stdout: versions.toString(),
    stderr: ''
  })
  getMockedLogger()

  const libraryChecker = new LibraryChecker(__dirname, 'HEAD')
  expect(libraryChecker.problems()).resolves.toStrictEqual({
    aplusb: '13538f5a3522dea046c434ace593eea54f0e807821bbc47facb76d67c32f7753',
    assignment:
      '7a92b9791b836e3b80a947bea1e5f3bf1d5e4de7452d9ea6419f00a000026e63',
    associative_array:
      'a373e5aceeb2bbd8a7ad1fc774706e2fcb63faa0c30847fe875bae40514f3dad',
    bernoulli_number:
      'cf0a75839d9c128c3e81d70956d9d329581730e6f189995d1459ee268bd7218e',
    binomial_coefficient:
      '6b978b95a3a54fa5e7d95ea789a6b32281dbaf6ae3398035bb91d706f47b157e',
    bipartite_edge_coloring:
      '7cbc1e76a125e32c19a28b9be82b1a3f81c17208441de83f0f9622cbfdb7224d',
    bipartitematching:
      'def5818605b370e402a6dd1718ea283251c7fb1e62b05dce5e0931f7604178da',
    bitwise_and_convolution:
      '0c9c10f1c80b06d61d9489c0d813a08ba270f8fc1a27491da19f670ea370dafd',
    bitwise_xor_convolution:
      '0b89510c1b289099019583209e70052fadffa868dafadd1c8e6e9f5490d3412b',
    cartesian_tree:
      'bb62333cc38d1fe77b8ae700a9a6f81df02556db42fa251d6f420acecc29d15d',
    characteristic_polynomial:
      'd77962927502c4eb5ff760ae8a40e45df5a88a521b46934cbfc4d7080d4dcdac',
    chordal_graph_recognition:
      'd4d8298203fffcd5d83a29bc8df25a7ac89026a0006dcc232766fdbdb1213ca9',
    chromatic_number:
      'b2d60d258f7a2f9899b66d670971ff5b7ebb6faa6fd6e624bca2f6e283f1214b',
    composition_of_formal_power_series:
      '9bc190feae7683955e3e5bdd54ae996c0fc1e0fb6a2d809ec0fc300d26e83ba6',
    convex_layers:
      'eb1526a741e63cf09965269700a32652107c2215c4bb6c2a73756ddb8e8e5a30',
    convolution_mod:
      '67f8ce9250529273fa9cf49733250292c73942383e86cb6ed012556876cbccc3',
    convolution_mod_1000000007:
      '6b9f97287189278a4be05712c1b9773aee168e0f197970abc331881f7defefab',
    convolution_mod_2_64:
      '914343da93cc5e41f54b9367d767d2f30d3fc59b0dd7edaba42298e8280cdf68',
    counting_primes:
      'ca5fa214903acac7405806d879876fe59f01014d4408c4e1b0b2e88e578ac062',
    cycle_detection:
      '736cd9b23e7463942b27329b360d7076cd4ae9e3940ab2b8d7acc88f6b952bcd',
    directedmst:
      'c9590e99cb0e59a6d75fd671a93c3f791a1a3fa46698e9fbc06e87ded7273586',
    discrete_logarithm_mod:
      'a03af33fb6085ac1f091b7e751cb1a10b1ae2c34b96c7bd07809ad52ed62108d',
    division_of_polynomials:
      '08f9ab65f56a207536f667411f2d096a4777a1f1139bd508efe596e53f75b8b6',
    dominatortree:
      '12f589db4a40166fccaea3599081bd5971b1ce00e702f936467154c0fe43c924',
    dynamic_graph_vertex_add_component_sum:
      '131de7da3ec7b3ee09f0e1b375a81ad02e91f7f438200fa9e6ffd0db17d90aa0',
    dynamic_sequence_range_affine_range_sum:
      '83d36379cad13e51b10ff2842f30e70b6b889e189cd74ad5645b2b9c8fba4377',
    dynamic_tree_subtree_add_subtree_sum:
      '01d89d27d026fd49479f966417434c39e351c4bcfaedcd34d93227e70ef44fc7',
    dynamic_tree_vertex_add_path_sum:
      '5d1503039335740e8722fc6ccacf92d21d11585f6d0c9b322f79b8d192ab982d',
    dynamic_tree_vertex_add_subtree_sum:
      '04cba00c047c7f34a5781580b6bfc69353fb407e6c4910cc84ee697c27e33095',
    dynamic_tree_vertex_set_path_composite:
      '47b542bcf7ed72d57250201b89adea3b689bb387df1e60c894225f997f111487',
    enumerate_palindromes:
      'f4f3775c44942e3c4a5727b8ac326fd66502ce85615f3846a4a0d139611d0caa',
    enumerate_primes:
      'd53c7140805a349c5c41bf2e9884d1e447adb13124ee723a998f065eb2e339a4',
    enumerate_triangles:
      'dede82f6039eb589e856c83c7cb62808d603126b366d2b23155ad47d26ca3df7',
    exp_of_formal_power_series:
      '3f4c0e2f718dcc737926b5405ffb24be69ff7c14d04bfd6ee392ef8d4ad579ff',
    factorize:
      '4ba8394b7a704f9f9cfba9e37e993965fcdb3edb7832ee27a3142d265b4db65d',
    find_linear_recurrence:
      '4a5d7101806030b7af5e8616afd4026af1f7ec72dc39ff3b1d1aeb1ccb92d7cc',
    frequency_table_of_tree_distance:
      'a76ab6cb623a47251177c789ce34f358f24c24fd34a47e93436e19f36592dbb2',
    general_matching:
      '171841b2274f01ba886dfeedce8957c775d17634cf32cfc6ffcf33947472e4b8',
    global_minimum_cut_of_dynamic_star_augmented_graph:
      'd112c507837b84d9532b0fbfd3143e2a63daac81a020f4850d14e817affd1037',
    hafnian_of_matrix:
      '8112f1eea3db2ce65ab05eb39cbdd0917d3d786b725a7cd902f789ae7e69e7df',
    inv_of_formal_power_series:
      'b147623d15ebcb85dd0bdaab822ed0edb4e0dc42f09d7be508e8ae206b4219f6',
    inv_of_polynomials:
      '87427c0214aa226103d9e68ee62d623a9869f2825b437ec8bfaf64b702599c5d',
    inverse_matrix:
      'b52d563b627192d22fafc45d8a748295b82446f223d251509bbf962c49b3667c',
    k_shortest_walk:
      '1ad8eb2ab804329b7ee39d890b92a3b03debca61cd888376b8763d67f44c6df8',
    kth_root_integer:
      'e21388c348e8a387b3114b306aeeb3af6c3891aec4666e13418b7d1a8d0202d3',
    kth_root_mod:
      '0250167d25aad906d91fa4a7cb8185ae8b299eb7a346f9dd1e13fb511e6edf8f',
    kth_term_of_linearly_recurrent_sequence:
      'cee83228c78930c40f93b5b6597549ca80fcb52c778ca789379e5bb54a004b7c',
    lca: 'a43e978aede707004e529027e15ff920233ce3e9fb36ed76ea90ce6b08c5bb66',
    line_add_get_min:
      '68831049a38f29e74118a351efc95e76755ade4bdc07e1729c61282de2f8f357',
    log_of_formal_power_series:
      'b2142f6d32ec4840b2f084f74185e7cf3f8611d9e221b871efe83e1fd5f2f1b4',
    manhattanmst:
      '2a288263bfe781a084c75bfbf15918525242dcdb8c62fa1374c1a77c788798ed',
    many_aplusb:
      '25bed420c46efda0eb264cf3aecff7848d5a72e67a1b7c9d52b6f5f220b7812a',
    matrix_det:
      'f32f872ee7e31e5fdd98d9352aaa7ca7c3a0a43c79f898abea799bbd670e091c',
    matrix_product:
      '4977b61d484f8fc5b6634c91cc5cabfcae828dac7bba0ef4b207d7f1f47ad414',
    maximum_independent_set:
      '41fdd3dada94eae9e0fb6e0a7354240fd5be21782c55c7622c888ebf85488ea2',
    min_cost_b_flow:
      'a5aeca1dbb4606fe22835b7842dde92c8ece7b1c5fcacbac96a5d5c46934e2d1',
    montmort_number_mod:
      '7684bcb52586a411fd4308a06414ee494d66e7c335a10325af2a1cae266d1bb2',
    multipoint_evaluation:
      '368165e67db050d76650f8100fb513475553e00a701049efd3ade477224d7a34',
    multivariate_convolution:
      '85037d784e5351e13aa77db4a0f1226ec77d6798cd67f9a84cf9a209cb6fa831',
    nim_product_64:
      '72716886a0096058de78d3ce3ef1655263dd04524ab68d2280d4887d1583ed90',
    number_of_substrings:
      'c8e08ed4834a7c19496228f967efd2f5212e2963950b5e0bff5432e220e8fff9',
    partition_function:
      'c1ed0418896523e8d25dfb5a16d89eca4284b41b21a3bfd68e1fe66128013ba7',
    persistent_queue:
      'ca2b3931659cfea39379bbed501f28647948e8d36768ee0e12149cdfa10f9649',
    persistent_unionfind:
      'c6971c11445085ce15b3fbd2c9ff7a1b37ffc0a3f8055e70e5660c2d046a3fbe',
    point_add_range_sum:
      '907951590b6e0af7add91543f45c679d0da89f796ded4e1d8ea3a13f32de2373',
    point_add_rectangle_sum:
      '6efd63d57e1a2d49ab42b89b75131ea86b54105e369319b7cb90ea8fe67d795b',
    point_set_range_composite:
      'd03bd9bbe232c40dcc7e7fe75cc44ce6c41a3a2d08467fb7bec96b99daa5829e',
    polynomial_interpolation:
      '9d7e18751d2700e889c6e572268962f7b6b2dc979a6e06699292ddce0bad38a7',
    polynomial_taylor_shift:
      '82c0472ea5cf0095e00ffefb22151973d6cf840ff026495c55bdbba4e23d5e9d',
    pow_of_formal_power_series:
      'cf31efdc00c83a771190395d0488a3c738f604dd86c9d1bef4f04013353a4a5e',
    predecessor_problem:
      '4531b24ba4629078ca9dd6bcbb1dc364a58a3b72bba4bc50b390533f85e4821a',
    queue_operate_all_composite:
      '6f3fef8555ddb870ca9bb68759c3001cb596948b68583868f39472070c4c93bf',
    range_affine_range_sum:
      'f3cc37175def4cd64f7161981892b7b5db7b7bc46469b203735b42c5c925e7dd',
    range_chmin_chmax_add_range_sum:
      'cb37695fc246688793408465096246f980bc65e2315e0370e0b640b1d667d016',
    range_kth_smallest:
      '3d37d369f5c55728151d1d8d4b82930797f953752b202d263eb96bde86ed2555',
    rectangle_sum:
      'e9768689f962ddac7456f1717a87bf8a3542fd51fd9905bda2a0703df05275c2',
    runenumerate:
      '9ffc1a5520a71508c702437de3dba65338e6dc35ca589a8bc820eb3f253bc4bb',
    scc: '438265706008a5204ba823a2b74e2de9db56b78a4802215299428cdb0baded95',
    segment_add_get_min:
      '7a57175330ed27aca8620b34b8cca1d55306b9f5ebc85e8dae6b41133cab0c2b',
    set_xor_min:
      '5319edfa6514d87ad0e49d1dba8f2d3a5b85bf01f45218fd4fdadc8c5a493b6f',
    sharp_p_subset_sum:
      '3f5fe965b168c5c04f63e226b1b95cef599e885ee19227b69fa8ffff63361476',
    shortest_path:
      '21b318dd20ed30fe8b37899c4c1749c73560e835a826f39acdf8041e168c84af',
    sort_points_by_argument:
      'd7d47ff0c70a56a486bd6276ad7343f66230f02687578a59caced5353b39aa37',
    sparse_matrix_det:
      '1b9ce4a33d74ea07ceed9fefe115b31e2ce74bb3b2e4246dabb40a1bf631f0bf',
    sqrt_mod:
      '31c843a2776beaaa1f58fb0cdd5794770ca8aa2c4de6ba03b164754720c51297',
    sqrt_of_formal_power_series:
      '5f68ac0a10dc04f3a767fdf0890bc84baa1ffab0173ca97973705c2d08b50842',
    static_range_inversions_query:
      '376f78c7725e79397ada19a8a8e1ec079c8166108806c6ade5b84a6b120bb2c7',
    static_range_sum:
      'e73289b02f6e13c6815ffdee5a47e24ec0b150d0085706d2a9600a7cf0c23cee',
    staticrmq:
      'b6eee0212049d444f8266ffbe6254f3e917c17b7251499505f21570c31b1be48',
    stirling_number_of_the_first_kind:
      '319af8962778faaa3e17bf11becf5ca7317e246a758c27c6559a3958ba124a08',
    stirling_number_of_the_second_kind:
      '3a7a888e2441aa0ce302c3b728a6f22ede44c5efe797329d74f307ff67d3f0aa',
    subset_convolution:
      '167b2cf3e47bc0bb0c468ac1dea816f033ab7c72f3b59b086eb235779b03c878',
    suffixarray:
      '1cab5ff6dc4a51e9e61dd2a1c5f5392e45683be9a1e3a68384b9c1fd60dcaf24',
    sum_of_exponential_times_polynomial:
      '7e19421a2c32b9bc3727d40fd21492d8ca99097f262cd385c3e04cbc97c03d36',
    sum_of_exponential_times_polynomial_limit:
      '25ffde28b78e3a8930710a0bcf391b5e295409fb7c6c61ff2dacd2690105759a',
    sum_of_floor_of_linear:
      '5e682c3a0c4a96b0673ed7edac836ea369b5eb7acf365811250464c1c031219f',
    sum_of_totient_function:
      '5ab305e865a63090aea95dd5326f14c9af1efcbc5749a9e36cf2eec0a5224c15',
    system_of_linear_equations:
      '0db75e83a2f1976d6afbaef847eae839c714a4bf2999af6dc515b3a94c44a902',
    tetration_mod:
      'dce1d9977b35861bbf2f8c484ed462a9c636cee43fb0e62eef4d86921abe6d26',
    three_edge_connected_components:
      'a4056b1a7ff599b7b5cf9f393519a23d99d1e6301838856eb69276f74fb3b8bb',
    tree_decomposition_width_2:
      '9ce0aac5f84e3c72965ebdd8d7ad45e6ca2e41db165c907f6ba2220745a29544',
    tree_diameter:
      '730fd172f7c94769d526fc128baea9c4bb1f1a2b4bab36cd5fbd467a6cb89d9f',
    two_edge_connected_components:
      'fb357c0337af6bbc39436a643626fba31e00a645ff8c820da5aad19a38d96c5f',
    two_sat: '38a61010f2f344c7035b2f2bbc58782bdb60341251f7ee231f89ff7c203d70fc',
    unionfind:
      '8411e7a46f01f2e954c9c690e0ca24109f8b693b56016c931960136c3d5eaa63',
    vertex_add_path_sum:
      'cde914e576817200f6ed0c58ecaf9eb834e0ce9c3bb26904a39b0ea6d2398e76',
    vertex_add_subtree_sum:
      'c4e724bbb530d1b7d04fed977128101cdd1e1181003b83c1552133958926a6aa',
    vertex_set_path_composite:
      '0561d09072b65959834bb8a0f597553339556b0e24f366d0f3382002e276cec3',
    zalgorithm:
      'b5b3c879390d4f419ba4363850a2b0770211bd48011300d33bf57b8f86f61296'
  })
})
