import * as exec from '@actions/exec'
import * as cache from '@actions/cache'
import fs from 'fs'
import path from 'path'
import {LibraryChecker} from '../src/libraryChecker'
import {getMockedLogger} from './util'

test('generate', async () => {
  jest.spyOn(cache, 'saveCache').mockResolvedValue(0)
  const execMock = jest.spyOn(exec, 'exec').mockResolvedValueOnce(0)
  getMockedLogger()
  const libraryChecker = new LibraryChecker(__dirname)
  await libraryChecker.generate(['aplusb', 'unionfind'])
  expect(execMock).toBeCalledTimes(1)
  expect(execMock).toBeCalledWith(
    'python3',
    ['generate.py', '-p', 'aplusb', 'unionfind'],
    {cwd: __dirname}
  )
})

test('problems', async () => {
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

  const libraryChecker = new LibraryChecker(__dirname)
  expect(libraryChecker.problems()).resolves.toStrictEqual([
    {
      name: 'aplusb',
      version:
        '13538f5a3522dea046c434ace593eea54f0e807821bbc47facb76d67c32f7753'
    },
    {
      name: 'assignment',
      version:
        '7a92b9791b836e3b80a947bea1e5f3bf1d5e4de7452d9ea6419f00a000026e63'
    },
    {
      name: 'associative_array',
      version:
        'a373e5aceeb2bbd8a7ad1fc774706e2fcb63faa0c30847fe875bae40514f3dad'
    },
    {
      name: 'bernoulli_number',
      version:
        'cf0a75839d9c128c3e81d70956d9d329581730e6f189995d1459ee268bd7218e'
    },
    {
      name: 'binomial_coefficient',
      version:
        '6b978b95a3a54fa5e7d95ea789a6b32281dbaf6ae3398035bb91d706f47b157e'
    },
    {
      name: 'bipartite_edge_coloring',
      version:
        '7cbc1e76a125e32c19a28b9be82b1a3f81c17208441de83f0f9622cbfdb7224d'
    },
    {
      name: 'bipartitematching',
      version:
        'def5818605b370e402a6dd1718ea283251c7fb1e62b05dce5e0931f7604178da'
    },
    {
      name: 'bitwise_and_convolution',
      version:
        '0c9c10f1c80b06d61d9489c0d813a08ba270f8fc1a27491da19f670ea370dafd'
    },
    {
      name: 'bitwise_xor_convolution',
      version:
        '0b89510c1b289099019583209e70052fadffa868dafadd1c8e6e9f5490d3412b'
    },
    {
      name: 'cartesian_tree',
      version:
        'bb62333cc38d1fe77b8ae700a9a6f81df02556db42fa251d6f420acecc29d15d'
    },
    {
      name: 'characteristic_polynomial',
      version:
        'd77962927502c4eb5ff760ae8a40e45df5a88a521b46934cbfc4d7080d4dcdac'
    },
    {
      name: 'chordal_graph_recognition',
      version:
        'd4d8298203fffcd5d83a29bc8df25a7ac89026a0006dcc232766fdbdb1213ca9'
    },
    {
      name: 'chromatic_number',
      version:
        'b2d60d258f7a2f9899b66d670971ff5b7ebb6faa6fd6e624bca2f6e283f1214b'
    },
    {
      name: 'composition_of_formal_power_series',
      version:
        '9bc190feae7683955e3e5bdd54ae996c0fc1e0fb6a2d809ec0fc300d26e83ba6'
    },
    {
      name: 'convex_layers',
      version:
        'eb1526a741e63cf09965269700a32652107c2215c4bb6c2a73756ddb8e8e5a30'
    },
    {
      name: 'convolution_mod',
      version:
        '67f8ce9250529273fa9cf49733250292c73942383e86cb6ed012556876cbccc3'
    },
    {
      name: 'convolution_mod_1000000007',
      version:
        '6b9f97287189278a4be05712c1b9773aee168e0f197970abc331881f7defefab'
    },
    {
      name: 'convolution_mod_2_64',
      version:
        '914343da93cc5e41f54b9367d767d2f30d3fc59b0dd7edaba42298e8280cdf68'
    },
    {
      name: 'counting_primes',
      version:
        'ca5fa214903acac7405806d879876fe59f01014d4408c4e1b0b2e88e578ac062'
    },
    {
      name: 'cycle_detection',
      version:
        '736cd9b23e7463942b27329b360d7076cd4ae9e3940ab2b8d7acc88f6b952bcd'
    },
    {
      name: 'directedmst',
      version:
        'c9590e99cb0e59a6d75fd671a93c3f791a1a3fa46698e9fbc06e87ded7273586'
    },
    {
      name: 'discrete_logarithm_mod',
      version:
        'a03af33fb6085ac1f091b7e751cb1a10b1ae2c34b96c7bd07809ad52ed62108d'
    },
    {
      name: 'division_of_polynomials',
      version:
        '08f9ab65f56a207536f667411f2d096a4777a1f1139bd508efe596e53f75b8b6'
    },
    {
      name: 'dominatortree',
      version:
        '12f589db4a40166fccaea3599081bd5971b1ce00e702f936467154c0fe43c924'
    },
    {
      name: 'dynamic_graph_vertex_add_component_sum',
      version:
        '131de7da3ec7b3ee09f0e1b375a81ad02e91f7f438200fa9e6ffd0db17d90aa0'
    },
    {
      name: 'dynamic_sequence_range_affine_range_sum',
      version:
        '83d36379cad13e51b10ff2842f30e70b6b889e189cd74ad5645b2b9c8fba4377'
    },
    {
      name: 'dynamic_tree_subtree_add_subtree_sum',
      version:
        '01d89d27d026fd49479f966417434c39e351c4bcfaedcd34d93227e70ef44fc7'
    },
    {
      name: 'dynamic_tree_vertex_add_path_sum',
      version:
        '5d1503039335740e8722fc6ccacf92d21d11585f6d0c9b322f79b8d192ab982d'
    },
    {
      name: 'dynamic_tree_vertex_add_subtree_sum',
      version:
        '04cba00c047c7f34a5781580b6bfc69353fb407e6c4910cc84ee697c27e33095'
    },
    {
      name: 'dynamic_tree_vertex_set_path_composite',
      version:
        '47b542bcf7ed72d57250201b89adea3b689bb387df1e60c894225f997f111487'
    },
    {
      name: 'enumerate_palindromes',
      version:
        'f4f3775c44942e3c4a5727b8ac326fd66502ce85615f3846a4a0d139611d0caa'
    },
    {
      name: 'enumerate_primes',
      version:
        'd53c7140805a349c5c41bf2e9884d1e447adb13124ee723a998f065eb2e339a4'
    },
    {
      name: 'enumerate_triangles',
      version:
        'dede82f6039eb589e856c83c7cb62808d603126b366d2b23155ad47d26ca3df7'
    },
    {
      name: 'exp_of_formal_power_series',
      version:
        '3f4c0e2f718dcc737926b5405ffb24be69ff7c14d04bfd6ee392ef8d4ad579ff'
    },
    {
      name: 'factorize',
      version:
        '4ba8394b7a704f9f9cfba9e37e993965fcdb3edb7832ee27a3142d265b4db65d'
    },
    {
      name: 'find_linear_recurrence',
      version:
        '4a5d7101806030b7af5e8616afd4026af1f7ec72dc39ff3b1d1aeb1ccb92d7cc'
    },
    {
      name: 'frequency_table_of_tree_distance',
      version:
        'a76ab6cb623a47251177c789ce34f358f24c24fd34a47e93436e19f36592dbb2'
    },
    {
      name: 'general_matching',
      version:
        '171841b2274f01ba886dfeedce8957c775d17634cf32cfc6ffcf33947472e4b8'
    },
    {
      name: 'global_minimum_cut_of_dynamic_star_augmented_graph',
      version:
        'd112c507837b84d9532b0fbfd3143e2a63daac81a020f4850d14e817affd1037'
    },
    {
      name: 'hafnian_of_matrix',
      version:
        '8112f1eea3db2ce65ab05eb39cbdd0917d3d786b725a7cd902f789ae7e69e7df'
    },
    {
      name: 'inv_of_formal_power_series',
      version:
        'b147623d15ebcb85dd0bdaab822ed0edb4e0dc42f09d7be508e8ae206b4219f6'
    },
    {
      name: 'inv_of_polynomials',
      version:
        '87427c0214aa226103d9e68ee62d623a9869f2825b437ec8bfaf64b702599c5d'
    },
    {
      name: 'inverse_matrix',
      version:
        'b52d563b627192d22fafc45d8a748295b82446f223d251509bbf962c49b3667c'
    },
    {
      name: 'k_shortest_walk',
      version:
        '1ad8eb2ab804329b7ee39d890b92a3b03debca61cd888376b8763d67f44c6df8'
    },
    {
      name: 'kth_root_integer',
      version:
        'e21388c348e8a387b3114b306aeeb3af6c3891aec4666e13418b7d1a8d0202d3'
    },
    {
      name: 'kth_root_mod',
      version:
        '0250167d25aad906d91fa4a7cb8185ae8b299eb7a346f9dd1e13fb511e6edf8f'
    },
    {
      name: 'kth_term_of_linearly_recurrent_sequence',
      version:
        'cee83228c78930c40f93b5b6597549ca80fcb52c778ca789379e5bb54a004b7c'
    },
    {
      name: 'lca',
      version:
        'a43e978aede707004e529027e15ff920233ce3e9fb36ed76ea90ce6b08c5bb66'
    },
    {
      name: 'line_add_get_min',
      version:
        '68831049a38f29e74118a351efc95e76755ade4bdc07e1729c61282de2f8f357'
    },
    {
      name: 'log_of_formal_power_series',
      version:
        'b2142f6d32ec4840b2f084f74185e7cf3f8611d9e221b871efe83e1fd5f2f1b4'
    },
    {
      name: 'manhattanmst',
      version:
        '2a288263bfe781a084c75bfbf15918525242dcdb8c62fa1374c1a77c788798ed'
    },
    {
      name: 'many_aplusb',
      version:
        '25bed420c46efda0eb264cf3aecff7848d5a72e67a1b7c9d52b6f5f220b7812a'
    },
    {
      name: 'matrix_det',
      version:
        'f32f872ee7e31e5fdd98d9352aaa7ca7c3a0a43c79f898abea799bbd670e091c'
    },
    {
      name: 'matrix_product',
      version:
        '4977b61d484f8fc5b6634c91cc5cabfcae828dac7bba0ef4b207d7f1f47ad414'
    },
    {
      name: 'maximum_independent_set',
      version:
        '41fdd3dada94eae9e0fb6e0a7354240fd5be21782c55c7622c888ebf85488ea2'
    },
    {
      name: 'min_cost_b_flow',
      version:
        'a5aeca1dbb4606fe22835b7842dde92c8ece7b1c5fcacbac96a5d5c46934e2d1'
    },
    {
      name: 'montmort_number_mod',
      version:
        '7684bcb52586a411fd4308a06414ee494d66e7c335a10325af2a1cae266d1bb2'
    },
    {
      name: 'multipoint_evaluation',
      version:
        '368165e67db050d76650f8100fb513475553e00a701049efd3ade477224d7a34'
    },
    {
      name: 'multivariate_convolution',
      version:
        '85037d784e5351e13aa77db4a0f1226ec77d6798cd67f9a84cf9a209cb6fa831'
    },
    {
      name: 'nim_product_64',
      version:
        '72716886a0096058de78d3ce3ef1655263dd04524ab68d2280d4887d1583ed90'
    },
    {
      name: 'number_of_substrings',
      version:
        'c8e08ed4834a7c19496228f967efd2f5212e2963950b5e0bff5432e220e8fff9'
    },
    {
      name: 'partition_function',
      version:
        'c1ed0418896523e8d25dfb5a16d89eca4284b41b21a3bfd68e1fe66128013ba7'
    },
    {
      name: 'persistent_queue',
      version:
        'ca2b3931659cfea39379bbed501f28647948e8d36768ee0e12149cdfa10f9649'
    },
    {
      name: 'persistent_unionfind',
      version:
        'c6971c11445085ce15b3fbd2c9ff7a1b37ffc0a3f8055e70e5660c2d046a3fbe'
    },
    {
      name: 'point_add_range_sum',
      version:
        '907951590b6e0af7add91543f45c679d0da89f796ded4e1d8ea3a13f32de2373'
    },
    {
      name: 'point_add_rectangle_sum',
      version:
        '6efd63d57e1a2d49ab42b89b75131ea86b54105e369319b7cb90ea8fe67d795b'
    },
    {
      name: 'point_set_range_composite',
      version:
        'd03bd9bbe232c40dcc7e7fe75cc44ce6c41a3a2d08467fb7bec96b99daa5829e'
    },
    {
      name: 'polynomial_interpolation',
      version:
        '9d7e18751d2700e889c6e572268962f7b6b2dc979a6e06699292ddce0bad38a7'
    },
    {
      name: 'polynomial_taylor_shift',
      version:
        '82c0472ea5cf0095e00ffefb22151973d6cf840ff026495c55bdbba4e23d5e9d'
    },
    {
      name: 'pow_of_formal_power_series',
      version:
        'cf31efdc00c83a771190395d0488a3c738f604dd86c9d1bef4f04013353a4a5e'
    },
    {
      name: 'predecessor_problem',
      version:
        '4531b24ba4629078ca9dd6bcbb1dc364a58a3b72bba4bc50b390533f85e4821a'
    },
    {
      name: 'queue_operate_all_composite',
      version:
        '6f3fef8555ddb870ca9bb68759c3001cb596948b68583868f39472070c4c93bf'
    },
    {
      name: 'range_affine_range_sum',
      version:
        'f3cc37175def4cd64f7161981892b7b5db7b7bc46469b203735b42c5c925e7dd'
    },
    {
      name: 'range_chmin_chmax_add_range_sum',
      version:
        'cb37695fc246688793408465096246f980bc65e2315e0370e0b640b1d667d016'
    },
    {
      name: 'range_kth_smallest',
      version:
        '3d37d369f5c55728151d1d8d4b82930797f953752b202d263eb96bde86ed2555'
    },
    {
      name: 'rectangle_sum',
      version:
        'e9768689f962ddac7456f1717a87bf8a3542fd51fd9905bda2a0703df05275c2'
    },
    {
      name: 'runenumerate',
      version:
        '9ffc1a5520a71508c702437de3dba65338e6dc35ca589a8bc820eb3f253bc4bb'
    },
    {
      name: 'scc',
      version:
        '438265706008a5204ba823a2b74e2de9db56b78a4802215299428cdb0baded95'
    },
    {
      name: 'segment_add_get_min',
      version:
        '7a57175330ed27aca8620b34b8cca1d55306b9f5ebc85e8dae6b41133cab0c2b'
    },
    {
      name: 'set_xor_min',
      version:
        '5319edfa6514d87ad0e49d1dba8f2d3a5b85bf01f45218fd4fdadc8c5a493b6f'
    },
    {
      name: 'sharp_p_subset_sum',
      version:
        '3f5fe965b168c5c04f63e226b1b95cef599e885ee19227b69fa8ffff63361476'
    },
    {
      name: 'shortest_path',
      version:
        '21b318dd20ed30fe8b37899c4c1749c73560e835a826f39acdf8041e168c84af'
    },
    {
      name: 'sort_points_by_argument',
      version:
        'd7d47ff0c70a56a486bd6276ad7343f66230f02687578a59caced5353b39aa37'
    },
    {
      name: 'sparse_matrix_det',
      version:
        '1b9ce4a33d74ea07ceed9fefe115b31e2ce74bb3b2e4246dabb40a1bf631f0bf'
    },
    {
      name: 'sqrt_mod',
      version:
        '31c843a2776beaaa1f58fb0cdd5794770ca8aa2c4de6ba03b164754720c51297'
    },
    {
      name: 'sqrt_of_formal_power_series',
      version:
        '5f68ac0a10dc04f3a767fdf0890bc84baa1ffab0173ca97973705c2d08b50842'
    },
    {
      name: 'static_range_inversions_query',
      version:
        '376f78c7725e79397ada19a8a8e1ec079c8166108806c6ade5b84a6b120bb2c7'
    },
    {
      name: 'static_range_sum',
      version:
        'e73289b02f6e13c6815ffdee5a47e24ec0b150d0085706d2a9600a7cf0c23cee'
    },
    {
      name: 'staticrmq',
      version:
        'b6eee0212049d444f8266ffbe6254f3e917c17b7251499505f21570c31b1be48'
    },
    {
      name: 'stirling_number_of_the_first_kind',
      version:
        '319af8962778faaa3e17bf11becf5ca7317e246a758c27c6559a3958ba124a08'
    },
    {
      name: 'stirling_number_of_the_second_kind',
      version:
        '3a7a888e2441aa0ce302c3b728a6f22ede44c5efe797329d74f307ff67d3f0aa'
    },
    {
      name: 'subset_convolution',
      version:
        '167b2cf3e47bc0bb0c468ac1dea816f033ab7c72f3b59b086eb235779b03c878'
    },
    {
      name: 'suffixarray',
      version:
        '1cab5ff6dc4a51e9e61dd2a1c5f5392e45683be9a1e3a68384b9c1fd60dcaf24'
    },
    {
      name: 'sum_of_exponential_times_polynomial',
      version:
        '7e19421a2c32b9bc3727d40fd21492d8ca99097f262cd385c3e04cbc97c03d36'
    },
    {
      name: 'sum_of_exponential_times_polynomial_limit',
      version:
        '25ffde28b78e3a8930710a0bcf391b5e295409fb7c6c61ff2dacd2690105759a'
    },
    {
      name: 'sum_of_floor_of_linear',
      version:
        '5e682c3a0c4a96b0673ed7edac836ea369b5eb7acf365811250464c1c031219f'
    },
    {
      name: 'sum_of_totient_function',
      version:
        '5ab305e865a63090aea95dd5326f14c9af1efcbc5749a9e36cf2eec0a5224c15'
    },
    {
      name: 'system_of_linear_equations',
      version:
        '0db75e83a2f1976d6afbaef847eae839c714a4bf2999af6dc515b3a94c44a902'
    },
    {
      name: 'tetration_mod',
      version:
        'dce1d9977b35861bbf2f8c484ed462a9c636cee43fb0e62eef4d86921abe6d26'
    },
    {
      name: 'three_edge_connected_components',
      version:
        'a4056b1a7ff599b7b5cf9f393519a23d99d1e6301838856eb69276f74fb3b8bb'
    },
    {
      name: 'tree_decomposition_width_2',
      version:
        '9ce0aac5f84e3c72965ebdd8d7ad45e6ca2e41db165c907f6ba2220745a29544'
    },
    {
      name: 'tree_diameter',
      version:
        '730fd172f7c94769d526fc128baea9c4bb1f1a2b4bab36cd5fbd467a6cb89d9f'
    },
    {
      name: 'two_edge_connected_components',
      version:
        'fb357c0337af6bbc39436a643626fba31e00a645ff8c820da5aad19a38d96c5f'
    },
    {
      name: 'two_sat',
      version:
        '38a61010f2f344c7035b2f2bbc58782bdb60341251f7ee231f89ff7c203d70fc'
    },
    {
      name: 'unionfind',
      version:
        '8411e7a46f01f2e954c9c690e0ca24109f8b693b56016c931960136c3d5eaa63'
    },
    {
      name: 'vertex_add_path_sum',
      version:
        'cde914e576817200f6ed0c58ecaf9eb834e0ce9c3bb26904a39b0ea6d2398e76'
    },
    {
      name: 'vertex_add_subtree_sum',
      version:
        'c4e724bbb530d1b7d04fed977128101cdd1e1181003b83c1552133958926a6aa'
    },
    {
      name: 'vertex_set_path_composite',
      version:
        '0561d09072b65959834bb8a0f597553339556b0e24f366d0f3382002e276cec3'
    },
    {
      name: 'zalgorithm',
      version:
        'b5b3c879390d4f419ba4363850a2b0770211bd48011300d33bf57b8f86f61296'
    }
  ])
})
